const readline = require('node:readline');
const fs = require('node:fs');
const path = require('node:path');

const lectures = JSON.parse(fs.readFileSync(path.join(__dirname, 'lectures.json'), 'utf8'));

function textResult(id, text, isError = false) {
  return {
    jsonrpc: '2.0',
    id: id,
    result: {
      content: [{ type: 'text', text: String(text) }],
      isError: Boolean(isError),
    },
  };
}

const tools = [
  {
    name: 'find_lecture',
    description: 'Return the title and topics of one course lecture by its number. Use when the user asks what a lecture covers.',
    inputSchema: {
      type: 'object',
      properties: { number: { type: 'integer', description: 'Lecture number' } },
      required: ['number'],
    },
  },
  {
    name: 'list_lectures',
    description: 'List the number and title of every course lecture. Use when the user asks for an overview of all lectures.',
    inputSchema: { type: 'object', properties: {} },
  },
];

function send(reply) {
  process.stdout.write(JSON.stringify(reply) + '\n');
}

function handle(msg) {
  if (msg.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        protocolVersion: msg.params.protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: 'lectures', version: '0.1.0' },
      },
    };
  }

  if (msg.method === 'notifications/initialized') {
    return null;
  }

  if (msg.method === 'tools/list') {
    return { jsonrpc: '2.0', id: msg.id, result: { tools: tools } };
  }

  if (msg.method === 'tools/call') {
    const name = msg.params.name;
    const args = msg.params.arguments || {};

    if (name === 'find_lecture') {
      const targetNumber = Number(args.number);
      const lecture = lectures.find((l) => Number(l.number) === targetNumber);

      if (!lecture) {
        return textResult(msg.id, 'There is no lecture ' + args.number + '.', true);
      }

      return textResult(msg.id, 'Lecture ' + lecture.number + ': ' + lecture.title, false);
    }

    if (name === 'list_lectures') {
      return textResult(msg.id, lectures.map((l) => l.number + '. ' + l.title).join('\n'), false);
    }

    return { jsonrpc: '2.0', id: msg.id, error: { code: -32602, message: 'Unknown tool: ' + name } };
  }

  if (msg.id !== undefined) {
    return { jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'Unknown method: ' + msg.method } };
  }

  return null;
}

const lines = readline.createInterface({ input: process.stdin });
lines.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const msg = JSON.parse(trimmed);
    const reply = handle(msg);
    if (reply) send(reply);
  } catch (err) {
    console.error('[mcp error] Failed to parse input:', err.message);
  }
});