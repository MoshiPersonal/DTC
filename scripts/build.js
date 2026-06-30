import fs from 'fs/promises'

const root = new URL('../', import.meta.url)
const dist = new URL('./dist/', root)

function parseEnvFile(content) {
  return content
    .split(/\r?\n/)
    .reduce(function (env, line) {
      var trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return env;
      var separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return env;
      var key = trimmed.slice(0, separatorIndex).trim();
      var value = trimmed.slice(separatorIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
      return env;
    }, {});
}

function readRuntimeEnv() {
  return Object.keys(process.env).reduce(function (env, key) {
    if (key.indexOf('VITE_') === 0) env[key] = process.env[key];
    return env;
  }, {});
}

function injectEnvConfig(html, env) {
  var script = '<script>window.__ENV__ = ' + JSON.stringify(env) + ';</script>';
  return html.replace('<!-- ENV_CONFIG -->', script);
}

async function build() {
  await fs.rm(dist, { recursive: true, force: true })
  await fs.mkdir(dist, { recursive: true })

  var envContent = '{}';
  try {
    envContent = await fs.readFile(new URL('.env', root), 'utf8');
  } catch (error) {}

  var envVars = Object.assign({}, readRuntimeEnv(), parseEnvFile(envContent));
  var html = await fs.readFile(new URL('index.html', root), 'utf8');
  html = injectEnvConfig(html, envVars);

  await fs.writeFile(new URL('index.html', dist), html)
  await fs.cp(new URL('assets', root), new URL('assets', dist), { recursive: true })

  console.log('Built static DTC site to dist/')
}

build().catch((error) => {
  console.error(error)
  process.exit(1)
})
