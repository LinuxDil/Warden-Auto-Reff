const inquirer = require('inquirer');
const fs = require('fs');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const cfonts = require('cfonts');
const { ethers } = require('ethers');
const UserAgent = require('user-agents');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';
const BOLD = '\x1b[1m';
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function createSpinner() {
  let index = 0;
  let interval = null;
  let isActive = false;

  function clearLine() {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.clearLine(0);
  }

  return {
    start(text) {
      if (isActive) this.stop();
      isActive = true;
      clearLine();
      process.stdout.write(`${CYAN}${SPINNER_FRAMES[index]} ${text}${RESET}`);
      interval = setInterval(() => {
        index = (index + 1) % SPINNER_FRAMES.length;
        clearLine();
        process.stdout.write(`${CYAN}${SPINNER_FRAMES[index]} ${text}${RESET}`);
      }, 100);
    },
    updateText(text) {
      if (!isActive) this.start(text);
      clearLine();
      process.stdout.write(`${CYAN}${SPINNER_FRAMES[index]} ${text}${RESET}`);
    },
    succeed(successText) {
      if (!isActive) return;
      clearInterval(interval);
      isActive = false;
      clearLine();
      process.stdout.write(`${GREEN}${BOLD}✔ ${successText}${RESET}\n`);
    },
    fail(failText) {
      if (!isActive) return;
      clearInterval(interval);
      isActive = false;
      clearLine();
      process.stdout.write(`${RED}✖ ${failText}${RESET}\n`);
    },
    stop() {
      if (!isActive) return;
      clearInterval(interval);
      isActive = false;
      clearLine();
    }
  };
}

function centerText(text) {
  const terminalWidth = process.stdout.columns || 80;
  const textLength = text.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));
  return ' '.repeat(padding) + text;
}

cfonts.say('AIRDROP SEEKER', {
  font: 'block',
  align: 'center',
  colors: ['cyan', 'black'],
});
console.log(centerText(`${BLUE}=== Telegram Channel: https://t.me/AirdropSeeker_Official ===${RESET}`));
console.log(centerText(`${CYAN}✪ WARDEN PROTOCOL AUTO REFF ✪${RESET}\n`));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function countdown(ms) {
  const seconds = Math.floor(ms / 1000);
  for (let i = seconds; i > 0; i--) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${YELLOW}Menunggu ${i} detik...${RESET}`);
    await delay(1000);
  }
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
}

function readProxiesFromFile(filename) {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    return content.split('\n').map(line => line.trim()).filter(line => line !== '');
  } catch (err) {
    console.log(`${RED}Gagal membaca file proxy.txt: ${err.message}${RESET}`);
    return [];
  }
}

function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/127.0.2651.86',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 OPR/113.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
    'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getAxiosConfig(proxy, headers) {
  const config = { headers };
  if (proxy) {
    const agent = new HttpsProxyAgent(proxy);
    config.httpAgent = agent;
    config.httpsAgent = agent;
  }
  return config;
}

async function validateReferralCode(referralCode, proxy) {
  const spinner = createSpinner();
  spinner.start('Memvalidasi kode referral...');
  await delay(300);
  try {
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'user-agent': getRandomUserAgent(),
      'origin': 'https://app.wardenprotocol.org',
      'referer': 'https://app.wardenprotocol.org/',
    };
    const config = getAxiosConfig(proxy, headers);
    const response = await axios.get(`https://api.app.wardenprotocol.org/api/users/validate-referral/${referralCode}`, config);
    if (response.data.valid) {
      spinner.succeed(' Kode Referral Valid');
      return response.data;
    } else {
      spinner.fail(' Kode Referral tidak valid');
      await delay(300);
      return null;
    }
  } catch (err) {
    spinner.fail(`Gagal memvalidasi kode referral: ${err.message}`);
    await delay(300);
    if (err.response) {
      console.log(`${RED}Error: Status ${err.response.status} - ${err.response.data.message || 'Unknown error'}${RESET}`);
    }
    return null;
  }
}

async function login(wallet, proxy = null, maxRetries = 10) {
  let retries = 0;
  let lastError = null;
  while (retries < maxRetries) {
    const nonceSpinner = createSpinner();
    nonceSpinner.start(`Getting nonce [ Retry ${retries + 1}/${maxRetries}... ]`);
    await delay(Math.floor(Math.random() * 2000) + 2000);

    try {
      const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'privy-app-id': 'cm7f00k5c02tibel0m4o9tdy1',
        'privy-client': 'react-auth:2.13.8',
        'user-agent': getRandomUserAgent(),
        'origin': 'https://app.wardenprotocol.org',
        'referer': 'https://app.wardenprotocol.org/',
      };
      const config = getAxiosConfig(proxy, headers);
      const initPayload = { address: wallet.address };
      await delay(1000);
      const initResponse = await axios.post('https://auth.privy.io/api/v1/siwe/init', initPayload, config);
      const { nonce } = initResponse.data;
      nonceSpinner.succeed(' Nonce berhasil diambil');

      const signSpinner = createSpinner();
      signSpinner.start(` Sign Wallet [ Retry ${retries + 1}/${maxRetries}... ]`);
      await delay(300);
      const issuedAt = new Date().toISOString();
      const message = `app.wardenprotocol.org wants you to sign in with your Ethereum account:\n${wallet.address}\n\nBy signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.\n\nURI: https://app.wardenprotocol.org\nVersion: 1\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${issuedAt}\nResources:\n- https://privy.io`;
      const signature = await wallet.signMessage(message);
      signSpinner.succeed(' Sign Wallet Successfully');

      const authSpinner = createSpinner();
      authSpinner.start(`Authenticating [ Retry ${retries + 1}/${maxRetries}... ]`);
      await delay(300);
      const authPayload = {
        message,
        signature,
        chainId: "eip155:8453",
        walletClientType: "metamask",
        connectorType: "injected",
        mode: "login-or-sign-up"
      };
      const authResponse = await axios.post('https://auth.privy.io/api/v1/siwe/authenticate', authPayload, config);
      const { token, refresh_token } = authResponse.data;
      authSpinner.succeed(' Login berhasil');
      return { token, refresh_token };
    } catch (err) {
      retries++;
      nonceSpinner.stop();
      lastError = err;
      const authSpinner = createSpinner();
      authSpinner.stop();
      if (err.response && err.response.status === 429) {
        const retrySpinner = createSpinner();
        retrySpinner.start(`Retrying Prosess, Please Wait...`);
        await delay(10000); 
        retrySpinner.stop();
        if (retries >= maxRetries) {
          const failSpinner = createSpinner();
          failSpinner.start(' Login gagal...');
          await delay(300);
          failSpinner.fail(` Login gagal Max Attempt  ${maxRetries} Reached: Rate limit exceeded (429)`);
          await delay(300);
          console.log(` ${RED}Error: Status 429 - Too many requests${RESET}`);
          throw new Error(`Login gagal setelah ${maxRetries} percobaan: Rate limit exceeded (429)`);
        }
      } else if (err.response && err.response.status === 409) {
        const failSpinner = createSpinner();
        failSpinner.start(' Login gagal...');
        await delay(300);
        failSpinner.fail(` Login gagal: Konflik server (409) - ${err.response.data.message || 'Unknown error'}`);
        await delay(300);
        console.log(`${RED}Error: Status 409 - ${err.response.data.message || 'Unknown error'}${RESET}`);
        throw new Error(`Konflik server (409): ${err.response.data.message || 'Unknown error'}`);
      } else {
        const failSpinner = createSpinner();
        failSpinner.start(' Login gagal...');
        await delay(300);
        failSpinner.fail(` Login gagal: ${err.message}`);
        await delay(300);
        if (err.response) {
          console.log(`${RED}Error: Status ${err.response.status} - ${err.response.data.message || 'Unknown error'}${RESET}`);
        }
        throw err;
      }
    }
  }
}

async function logoutSession(refreshToken, proxy = null) {
  const spinner = createSpinner();
  spinner.start('Logging out session...');
  await delay(300);
  try {
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'privy-app-id': 'cm7f00k5c02tibel0m4o9tdy1',
      'user-agent': getRandomUserAgent(),
      'origin': 'https://app.wardenprotocol.org',
      'referer': 'https://app.wardenprotocol.org/',
    };
    const config = getAxiosConfig(proxy, headers);
    const payload = { refresh_token: refreshToken };
    const response = await axios.post('https://auth.privy.io/api/v1/sessions/logout', payload, config);
    spinner.succeed(' Session logged out successfully');
    return response.data;
  } catch (err) {
    spinner.fail(` Failed to logout session: ${err.message}`);
    await delay(300);
    if (err.response) {
      console.log(`${RED}Error: Status ${err.response.status} - ${err.response.data.message || 'Unknown error'}${RESET}`);
    }
    return null;
  }
}

async function applyReferral(token, referralCode, proxy) {
  const spinner = createSpinner();
  spinner.start('Applyng Refferal Code...');
  await delay(300);
  try {
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `Bearer ${token}`,
      'user-agent': getRandomUserAgent(),
      'origin': 'https://app.wardenprotocol.org',
      'referer': 'https://app.wardenprotocol.org/',
    };
    const config = getAxiosConfig(proxy, headers);
    const response = await axios.get(`https://api.app.wardenprotocol.org/api/users/me?referralCode=${referralCode}`, config);
    if (response.data.referringUserId && response.data.referralsUsed >= 0) {
      spinner.succeed(' Code Refferal Applyed!!');
      return true;
    } else {
      spinner.fail(' Failed Applying Refferal Code: Data respons tidak valid');
      await delay(300);
      return false;
    }
  } catch (err) {
    spinner.fail(` Failed Applying Refferal Code: ${err.message}`);
    await delay(300);
    if (err.response) {
      console.log(`${RED}Error: Status ${err.response.status} - ${err.response.data.message || 'Unknown error'}${RESET}`);
    }
    return false;
  }
}

async function completeActivity(token, activityType, metadata, proxy = null) {
  const spinner = createSpinner();
  spinner.start(`Completing Activity: ${activityType}...`);
  await delay(300);
  try {
    const headers = {
      'accept': '*/*',
      'content-type': 'application/json',
      'authorization': `Bearer ${token}`,
      'user-agent': getRandomUserAgent(),
      'origin': 'https://app.wardenprotocol.org',
      'referer': 'https://app.wardenprotocol.org/',
    };
    const config = getAxiosConfig(proxy, headers);
    const payload = { activityType, metadata };
    const response = await axios.post('https://api.app.wardenprotocol.org/api/tokens/activity', payload, config);
    spinner.succeed(` ${activityType} Activity Completed`);
    return response.data;
  } catch (err) {
    spinner.fail(`Failed to complete ${activityType}: ${err.message}`);
    await delay(300);
    if (err.response && err.response.data.message === 'Activity already recorded today') {
      spinner.succeed(`${activityType} already recorded today`);
      return { message: 'Activity already recorded today', alreadyRecorded: true };
    }
    if (err.response) {
      console.log(`${RED}Error: Status ${err.response.status} - ${err.response.data.message || 'Unknown error'}${RESET}`);
    }
    throw err;
  }
}

async function main() {
  const { useProxy } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useProxy',
      message: `${CYAN}Apakah Anda ingin menggunakan proxy?${RESET}`,
      default: false,
    }
  ]);

  let proxyList = [];
  let proxyMode = null;
  if (useProxy) {
    const proxyAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'proxyType',
        message: `${CYAN}Pilih jenis proxy:${RESET}`,
        choices: ['Rotating', 'Static'],
      }
    ]);
    proxyMode = proxyAnswer.proxyType;
    proxyList = readProxiesFromFile('proxy.txt');
    if (proxyList.length > 0) {
      console.log(`${BLUE}Terdapat ${proxyList.length} proxy.${RESET}\n`);
    } else {
      console.log(`${YELLOW}File proxy.txt kosong atau tidak ditemukan, tidak menggunakan proxy.${RESET}\n`);
      useProxy = false;
    }
  }

  let count;
  while (true) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'count',
        message: `${CYAN}Masukkan jumlah akun: ${RESET}`,
        validate: (value) => {
          const parsed = parseInt(value, 10);
          if (isNaN(parsed) || parsed <= 0) {
            return `${RED}Harap masukkan angka yang valid lebih dari 0!${RESET}`;
          }
          return true;
        }
      }
    ]);
    count = parseInt(answer.count, 10);
    if (count > 0) break;
  }

  const { inviteCode } = await inquirer.prompt([
    {
      type: 'input',
      name: 'inviteCode',
      message: `${CYAN}Masukkan kode undangan: ${RESET}`,
    }
  ]);

  console.log(`${YELLOW}\n===================================${RESET}`);
  console.log(`${YELLOW}${BOLD}Membuat ${count} Akun ..${RESET}`);
  console.log(`${YELLOW}Note: Gunakan Proxy Untuk Meminimalisir Dari Deteksi System${RESET}`);
  console.log(`${YELLOW}=====================================${RESET}\n`);

  const fileName = 'account.json';
  let accounts = [];
  if (fs.existsSync(fileName)) {
    try {
      accounts = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } catch (err) {
      accounts = [];
    }
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    console.log(`${CYAN}${BOLD}\n================================ ACCOUNT ${i + 1}/${count} ===============================${RESET}`);

    let proxy = null;
    if (useProxy && proxyList.length > 0) {
      if (proxyMode === 'Rotating') {
        proxy = proxyList[i % proxyList.length];
      } else if (proxyMode === 'Static') {
        if (proxyList.length > 0) {
          proxy = proxyList.shift();
        } else {
          console.log(`${RED}Tidak ada proxy yang tersisa untuk mode static.${RESET}`);
          break;
        }
      }
      console.log(`${WHITE}Menggunakan proxy: ${proxy}${RESET}`);
    }

    let accountIP = '';
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json', {
        httpAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
        httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
      });
      accountIP = ipResponse.data.ip;
    } catch (error) {
      accountIP = "Gagal mendapatkan IP";
      console.log(`${RED}Error saat mendapatkan IP: ${error.message}${RESET}`);
    }
    console.log(`${WHITE}IP Yang Digunakan: ${accountIP}${RESET}\n`);

    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const privateKey = wallet.privateKey.startsWith('0x') ? wallet.privateKey.slice(2) : wallet.privateKey;

    console.log(`${GREEN}${BOLD}✔️ Wallet Created: ${walletAddress}${RESET}`);

    const validation = await validateReferralCode(inviteCode, proxy);
    if (!validation) {
      failCount++;
      console.log(`${YELLOW}\nProgress: ${i + 1}/${count} akun telah diproses. (Berhasil: ${successCount}, Gagal: ${failCount})${RESET}`);
      console.log(`${CYAN}${BOLD}====================================================================${RESET}\n`);
      if (i < count - 1) {
        const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
        await countdown(randomDelay);
      }
      continue;
    }

    let token, refresh_token;
    try {
      ({ token, refresh_token } = await login(wallet, proxy));
    } catch (err) {
      if (err.message.includes('Konflik server (409)')) {
        console.log(`${YELLOW}Mencoba wallet baru karena konflik server...${RESET}`);
        const newWallet = ethers.Wallet.createRandom();
        console.log(`${GREEN}${BOLD}✔️ Wallet Baru: ${newWallet.address}${RESET}`);
        try {
          ({ token, refresh_token } = await login(newWallet, proxy));
        } catch (newErr) {
          failCount++;
          console.log(`${YELLOW}\nProgress: ${i + 1}/${count} akun telah diproses. (Berhasil: ${successCount}, Gagal: ${failCount})${RESET}`);
          console.log(`${CYAN}${BOLD}====================================================================${RESET}\n`);
          if (i < count - 1) {
            const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
            await countdown(randomDelay);
          }
          continue;
        }
      } else {
        failCount++;
        console.log(`${YELLOW}\nProgress: ${i + 1}/${count} akun telah diproses. (Berhasil: ${successCount}, Gagal: ${failCount})${RESET}`);
        console.log(`${CYAN}${BOLD}====================================================================${RESET}\n`);
        if (i < count - 1) {
          const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
          await countdown(randomDelay);
        }
        continue;
      }
    }

    const applied = await applyReferral(token, inviteCode, proxy);
    if (!applied) {
      failCount++;
      await logoutSession(refresh_token, proxy);
      console.log(`${YELLOW}\nProgress: ${i + 1}/${count} akun telah diproses. (Berhasil: ${successCount}, Gagal: ${failCount})${RESET}`);
      console.log(`${CYAN}${BOLD}====================================================================${RESET}\n`);
      if (i < count - 1) {
        const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
        await countdown(randomDelay);
      }
      continue;
    }

    const loginMetadata = { action: "user_login", timestamp: new Date().toISOString(), source: "privy" };
    await completeActivity(token, "LOGIN", loginMetadata, proxy);

    const gameMetadata = { action: "game_play", timestamp: new Date().toISOString(), game_id: "default_game" };
    await completeActivity(token, "GAME_PLAY", gameMetadata, proxy);

    accounts.push({
      walletAddress,
      privateKey,
      registeredAt: new Date().toISOString()
    });
    try {
      fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2));
      console.log(`${GREEN}${BOLD}✔️  Data akun disimpan ke ${fileName}${RESET}`);
    } catch (err) {
      console.log(`${RED}✖ Gagal menyimpan data ke ${fileName}: ${err.message}${RESET}`);
    }

    await logoutSession(refresh_token, proxy);

    successCount++;
    console.log(`${YELLOW}\nProgress: ${i + 1}/${count} akun telah diproses. (Berhasil: ${successCount}, Gagal: ${failCount})${RESET}`);
    console.log(`${CYAN}${BOLD}====================================================================${RESET}\n`);

    if (i < count - 1) {
      const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
      await countdown(randomDelay);
    }
  }

  console.log(`${BLUE}${BOLD}\nProses selesai. Total akun berhasil: ${successCount}, Gagal: ${failCount}${RESET}`);
}

main().catch(err => console.log(`${RED}Terjadi error fatal: ${err.message}${RESET}`));
