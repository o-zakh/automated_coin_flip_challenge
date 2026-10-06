import { CoinSide, ScriptOutput } from '../types';

export interface PythonContext {
  balance: number;
  time_left: number;
  flip_count: number;
  history: Array<{
    flip: number;
    choice: string;
    stake: number;
    outcome: string;
    won: boolean;
    balance: number;
    pnl: number;
  }>;
}

/**
 * Wraps an individual history item to support dictionary-like methods
 * (.get('won', False)) and common aliases (round, side, bet, win, profit)
 */
function wrapHistoryItem(raw: Record<string, unknown> | undefined) {
  if (!raw) return raw;
  const enriched: Record<string, unknown> = {
    ...raw,
    round: raw.flip,
    bet: raw.stake,
    amount: raw.stake,
    side: raw.choice,
    result: raw.outcome,
    win: raw.won,
    profit: raw.pnl,
  };

  return new Proxy(enriched, {
    get(target, prop, receiver) {
      if (prop === 'get') {
        return (key: string, defaultVal: unknown = null) => {
          return key in target ? target[key] : defaultVal;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

/**
 * Creates a proxy-based history list to support Python negative indexing like history[-1]
 */
function createPythonCompatibleHistory(history: PythonContext['history']) {
  return new Proxy(history, {
    get(target, prop, receiver) {
      if (prop === 'get') {
        return (idx: number, defaultVal: unknown = null) => {
          const item = target[idx < 0 ? target.length + idx : idx];
          return item !== undefined ? wrapHistoryItem(item as unknown as Record<string, unknown>) : defaultVal;
        };
      }
      if (typeof prop === 'string') {
        const idx = Number(prop);
        if (!Number.isNaN(idx)) {
          const item = idx < 0 ? target[target.length + idx] : target[idx];
          return item !== undefined ? wrapHistoryItem(item as unknown as Record<string, unknown>) : undefined;
        }
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

/**
 * Transpiles common lightweight Python syntax into executable JavaScript.
 * Automatically declares variables using `var` to support Python's dynamic variable creation,
 * loops (for, while), dictionary accesses, and tuple returns.
 */
export function transpilePythonToJs(pythonCode: string): { js: string; detectedFnName?: string } {
  const lines = pythonCode.split('\n');
  const transformedLines: string[] = [];
  const indentStack: number[] = [0];
  let detectedFnName: string | undefined = undefined;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Check line indentation (only for non-empty, non-comment lines)
    const stripped = rawLine.trim();
    if (!stripped || stripped.startsWith('#')) {
      transformedLines.push(rawLine.replace(/#.*/, (m) => `// ${m.slice(1)}`));
      continue;
    }

    // Calculate leading spaces
    const indentMatch = rawLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;

    // Handle dedents
    while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      transformedLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }

    let line = stripped;

    // Strip inline comments, keeping strings safe
    let commentIndex = -1;
    let inSingle = false;
    let inDouble = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === "'" && !inDouble) inSingle = !inSingle;
      else if (ch === '"' && !inSingle) inDouble = !inDouble;
      else if (ch === '#' && !inSingle && !inDouble) {
        commentIndex = c;
        break;
      }
    }
    if (commentIndex !== -1) {
      line = line.substring(0, commentIndex).trim();
    }

    // Convert f-strings: f"Round {flip_count}: {stake}" -> `Round ${flip_count}: ${stake}`
    line = line.replace(/\bf(["'])(.*?)\1/g, (_, __, content: string) => {
      const interpolated = content.replace(/\{([^{}]+)\}/g, '${$1}');
      return `\`${interpolated}\``;
    });

    // Python 'def' function definition
    const defMatch = line.match(/^def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:/);
    if (defMatch) {
      const fnName = defMatch[1];
      const fnArgs = defMatch[2];
      if (!detectedFnName) {
        detectedFnName = fnName;
      }
      indentStack.push(indent + 4);
      transformedLines.push(' '.repeat(indent) + `function ${fnName}(${fnArgs}) {`);
      continue;
    }

    // Python 'for var in iter:' loop
    const forMatch = line.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+(.*?)\s*:/);
    if (forMatch) {
      indentStack.push(indent + 4);
      const varName = forMatch[1];
      const iterExpr = convertPythonLiteralsAndKeywords(forMatch[2]);
      transformedLines.push(' '.repeat(indent) + `for (var ${varName} of ${iterExpr}) {`);
      continue;
    }

    // Python 'while cond:' loop
    const whileMatch = line.match(/^while\s+(.*?)\s*:/);
    if (whileMatch) {
      indentStack.push(indent + 4);
      const cond = convertPythonCondition(whileMatch[1]);
      transformedLines.push(' '.repeat(indent) + `while (${cond}) {`);
      continue;
    }

    // Python 'elif'
    const elifMatch = line.match(/^elif\s+(.*?)\s*:/);
    if (elifMatch) {
      indentStack.push(indent + 4);
      const cond = convertPythonCondition(elifMatch[1]);
      transformedLines.push(' '.repeat(indent) + `else if (${cond}) {`);
      continue;
    }

    // Python 'if'
    const ifMatch = line.match(/^if\s+(.*?)\s*:/);
    if (ifMatch) {
      indentStack.push(indent + 4);
      const cond = convertPythonCondition(ifMatch[1]);
      transformedLines.push(' '.repeat(indent) + `if (${cond}) {`);
      continue;
    }

    // Python 'else:'
    const elseMatch = line.match(/^else\s*:/);
    if (elseMatch) {
      indentStack.push(indent + 4);
      transformedLines.push(' '.repeat(indent) + 'else {');
      continue;
    }

    // Python return a, b -> return [a, b]
    const returnMatch = line.match(/^return\s+(.+)$/);
    if (returnMatch) {
      const expr = returnMatch[1].trim();
      if (expr.includes(',') && !expr.startsWith('[') && !expr.startsWith('(') && !expr.startsWith('{')) {
        line = `return [${convertPythonLiteralsAndKeywords(expr)}]`;
      } else {
        line = `return ${convertPythonLiteralsAndKeywords(expr)}`;
      }
      transformedLines.push(' '.repeat(indent) + line + ';');
      continue;
    }

    // Python variable assignment:
    // 1. Tuple unpacking assignment: a, b = expr
    const tupleAssignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*(\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\s*=(?!=)\s*(.*)$/);
    if (tupleAssignMatch) {
      const targets = tupleAssignMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
      let rhs = tupleAssignMatch[3].trim();
      if (rhs.includes(',') && !rhs.startsWith('[') && !rhs.startsWith('(')) {
        rhs = `[${convertPythonLiteralsAndKeywords(rhs)}]`;
      } else {
        rhs = convertPythonLiteralsAndKeywords(rhs);
      }
      transformedLines.push(' '.repeat(indent) + `var [${targets.join(', ')}] = ${rhs};`);
      continue;
    }

    // 2. Simple assignment: var_name = expr
    // In Python, variables are defined upon assignment without any keyword.
    // By prepending `var`, we declare the variable in the function/runtime scope so it is always defined!
    const singleAssignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)\s*(.*)$/);
    if (singleAssignMatch) {
      const varName = singleAssignMatch[1];
      const rhs = convertPythonLiteralsAndKeywords(singleAssignMatch[2]);
      transformedLines.push(' '.repeat(indent) + `var ${varName} = ${rhs};`);
      continue;
    }

    // Other statements (e.g. augmented assignment +=, function calls like print(...), etc.)
    line = convertPythonLiteralsAndKeywords(line);
    transformedLines.push(' '.repeat(indent) + line + ';');
  }

  // Close remaining open blocks
  while (indentStack.length > 1) {
    indentStack.pop();
    transformedLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
  }

  return { js: transformedLines.join('\n'), detectedFnName };
}

function convertPythonCondition(cond: string): string {
  return convertPythonLiteralsAndKeywords(cond);
}

function convertPythonLiteralsAndKeywords(str: string): string {
  let res = str
    // Python True, False, None
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')
    // Python keywords
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\b\s*/g, '!')
    .replace(/\bis\s+not\s+None\b/g, '!== null')
    .replace(/\bis\s+None\b/g, '=== null')
    .replace(/\bis\s+not\b/g, '!==')
    // Python integer division //
    .replace(/(\w+)\s*\/\/\s*(\w+)/g, 'Math.floor($1 / $2)');

  return res;
}

/**
 * Executes the Python script for the current step.
 */
export function executePythonStrategy(
  pythonCode: string,
  context: PythonContext
): ScriptOutput {
  const startTime = performance.now();
  const logs: string[] = [];

  const safePrint = (...args: unknown[]) => {
    const formatted = args
      .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
      .join(' ');
    logs.push(formatted);
  };

  const safeLen = (val: unknown) => {
    if (Array.isArray(val) || typeof val === 'string') return val.length;
    if (val && typeof val === 'object') return Object.keys(val).length;
    return 0;
  };

  const safeMin = (...args: number[]) => Math.min(...args);
  const safeMax = (...args: number[]) => Math.max(...args);
  const safeRound = (val: number, decimals: number = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  };
  const safeAbs = (val: number) => Math.abs(val);

  const safeSum = (arr: unknown) => {
    if (Array.isArray(arr)) {
      return arr.reduce((acc, v) => acc + Number(v || 0), 0);
    }
    return 0;
  };

  const safeRange = (startOrStop: number, stop?: number, step: number = 1) => {
    let start = 0;
    let end = startOrStop;
    if (stop !== undefined) {
      start = startOrStop;
      end = stop;
    }
    const res: number[] = [];
    if (step > 0) {
      for (let i = start; i < end; i += step) res.push(i);
    } else if (step < 0) {
      for (let i = start; i > end; i += step) res.push(i);
    }
    return res;
  };

  const safeInt = (v: unknown) => parseInt(String(v), 10) || 0;
  const safeFloat = (v: unknown) => parseFloat(String(v)) || 0;
  const safeStr = (v: unknown) => String(v);
  const safeBool = (v: unknown) => Boolean(v);

  try {
    const { js: transpiled, detectedFnName } = transpilePythonToJs(pythonCode);

    // Build runtime function
    // Expose context variables and helper functions
    const runtimeBody = `
      var print = __print;
      var len = __len;
      var min = __min;
      var max = __max;
      var round = __round;
      var abs = __abs;
      var sum = __sum;
      var range = __range;
      var int = __int;
      var float = __float;
      var str = __str;
      var bool = __bool;

      var stake = 0;
      var choice = "heads";

      ${transpiled}

      // Check if user defined a function (detected name or standard get_bet / make_bet)
      var targetFn = null;
      if (typeof ${detectedFnName || 'get_bet'} === 'function') {
        targetFn = ${detectedFnName || 'get_bet'};
      } else if (typeof get_bet === 'function') {
        targetFn = get_bet;
      } else if (typeof make_bet === 'function') {
        targetFn = make_bet;
      }

      if (targetFn) {
        return targetFn(balance, time_left, flip_count, history);
      }

      // Otherwise return top-level stake and choice variables from the script
      return [stake, choice];
    `;

    // Create the evaluator
    const fn = new Function(
      'balance',
      'time_left',
      'flip_count',
      'history',
      '__print',
      '__len',
      '__min',
      '__max',
      '__round',
      '__abs',
      '__sum',
      '__range',
      '__int',
      '__float',
      '__str',
      '__bool',
      runtimeBody
    );

    const historyProxy = createPythonCompatibleHistory(context.history);
    const rawResult = fn(
      context.balance,
      context.time_left,
      context.flip_count,
      historyProxy,
      safePrint,
      safeLen,
      safeMin,
      safeMax,
      safeRound,
      safeAbs,
      safeSum,
      safeRange,
      safeInt,
      safeFloat,
      safeStr,
      safeBool
    );

    const executionTimeMs = performance.now() - startTime;

    // Parse the result: can be [stake, choice], [choice, stake], {stake, choice}, or number
    let stake = 0;
    let choice: CoinSide = 'heads';

    if (Array.isArray(rawResult)) {
      const first = rawResult[0];
      const second = rawResult[1];

      // Handle if returned [choice, stake] or [stake, choice]
      if (typeof first === 'string' && (typeof second === 'number' || typeof second === 'string')) {
        choice = parseCoinSide(first);
        stake = Number(second);
      } else {
        stake = Number(first);
        choice = parseCoinSide(second);
      }
    } else if (rawResult && typeof rawResult === 'object') {
      const obj = rawResult as Record<string, unknown>;
      stake = Number(obj.stake ?? obj.bet ?? obj.amount ?? 0);
      choice = parseCoinSide(obj.choice ?? obj.side);
    } else if (typeof rawResult === 'number') {
      stake = rawResult;
      choice = 'heads';
    }

    if (Number.isNaN(stake) || stake < 0) {
      stake = 0;
    }

    return {
      stake,
      choice,
      logs,
      executionTimeMs: Math.round(executionTimeMs * 100) / 100,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      stake: 0,
      choice: 'heads',
      logs,
      executionTimeMs: performance.now() - startTime,
      error: `Ошибка выполнения скрипта: ${errorMsg}`,
    };
  }
}

function parseCoinSide(val: unknown): CoinSide {
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    if (s === 'tails' || s === 'tail' || s === 'решка' || s === 'р' || s === 't') {
      return 'tails';
    }
  }
  return 'heads';
}

/**
 * Default starter Python template as requested by the user:
 * "Окно для скрипта уже должно содержать несложный код-подсказку.
 * Например, эта автоматизация должна всегда ставить половину от текущего баланса."
 */
export const DEFAULT_PYTHON_SCRIPT = `# Стратегия автоматических ставок Elm Wealth
# Бросок выполняется каждые 5 секунд (до 360 бросков за 30 минут)
# Входные параметры:
#   balance     - текущий баланс ($)
#   time_left   - секунд до завершения 30 минут
#   flip_count  - номер текущего броска (1, 2, ...)
#   history     - список предыдущих бросков

def get_bet(balance, time_left, flip_count, history):
    # Код-подсказка: ставить ровно 50% от текущего баланса на орла
    choice = "heads"        # "heads" (орёл, 60% шанс) или "tails" (решка, 40% шанс)
    stake = balance * 0.5   # 50% от текущего баланса
    
    return stake, choice
`;

export const KELLY_STRATEGY_CODE = `# Оптимальный алгоритм управления ставками (Разблокировано при $75+)
# Формула оптимальной доли: f* = (p*b - q)/b = (0.60*1 - 0.40)/1 = 20%
# Максимизирует геометрическую скорость роста (+2.01% за бросок)

def get_bet(balance, time_left, flip_count, history):
    choice = "heads"        # Всегда орёл (60% вероятность)
    stake = balance * 0.20  # Ровно 20% от текущего капитала
    
    return stake, choice
`;

export const PRESET_STRATEGIES = [
  {
    id: 'default_half',
    name: 'Пример кода (50% на Орла)',
    description: 'Базовый синтаксический пример: ставит 50% от текущего капитала на орла.',
    code: DEFAULT_PYTHON_SCRIPT,
  },
];
