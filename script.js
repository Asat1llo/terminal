/* Terminal Web — interactive shell-like website */
(function () {
  "use strict";

  const screen = document.getElementById("screen");
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const promptEl = document.getElementById("prompt");

  const USER = "guest";
  const HOST = "web";

  // ---------- Virtual filesystem ----------
  const fs = {
    "~": {
      type: "dir",
      children: {
        "about.txt":
          "Hi! I'm a developer who likes building fast, minimal,\n" +
          "no-nonsense web experiences. This site is one of them.\n" +
          "Type `projects` or `skills` to learn more.",
        "contact.txt":
          "email:    you@example.com\n" +
          "github:   https://github.com/Asatillo-2005\n" +
          "website:  https://asatillo-2005.github.io/terminal",
        "projects": {
          type: "dir",
          children: {
            "terminal-web.md":
              "# terminal-web\n" +
              "An interactive terminal-style website.\n" +
              "Stack: vanilla HTML, CSS, JS. Zero dependencies.",
            "ideas.md":
              "- A minimal markdown wiki\n" +
              "- A pomodoro timer in the menu bar\n" +
              "- A self-hosted RSS reader",
          },
        },
        "skills": {
          type: "dir",
          children: {
            "languages.txt": "JavaScript, TypeScript, Python, Go, HTML, CSS",
            "tools.txt": "git, docker, vite, node, linux, postgres",
          },
        },
      },
    },
  };

  let cwd = ["~"]; // path stack

  function getNode(pathArr) {
    let node = fs["~"];
    if (pathArr[0] !== "~") return null;
    for (let i = 1; i < pathArr.length; i++) {
      if (!node || node.type !== "dir") return null;
      node = node.children[pathArr[i]];
    }
    return node;
  }

  function pathToString(pathArr) {
    if (pathArr.length === 1) return "~";
    return "~/" + pathArr.slice(1).join("/");
  }

  function resolvePath(arg) {
    if (!arg || arg === "~") return ["~"];
    if (arg === "/") return ["~"];
    let parts;
    if (arg.startsWith("~/")) {
      parts = ["~", ...arg.slice(2).split("/").filter(Boolean)];
    } else if (arg.startsWith("/")) {
      parts = ["~", ...arg.slice(1).split("/").filter(Boolean)];
    } else {
      parts = [...cwd, ...arg.split("/").filter(Boolean)];
    }
    const stack = [];
    for (const p of parts) {
      if (p === "." || p === "") continue;
      if (p === "..") { if (stack.length > 1) stack.pop(); continue; }
      stack.push(p);
    }
    return stack;
  }

  // ---------- Output helpers ----------
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function linkify(s) {
    return s.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  function print(text, cls) {
    const line = el("div", "line " + (cls || ""));
    line.innerHTML = linkify(escapeHtml(text));
    screen.appendChild(line);
    scrollBottom();
  }

  function printRaw(html, cls) {
    const line = el("div", "line " + (cls || ""));
    line.innerHTML = html;
    screen.appendChild(line);
    scrollBottom();
  }

  function scrollBottom() {
    screen.scrollTop = screen.scrollHeight;
  }

  function updatePrompt() {
    promptEl.textContent = `${USER}@${HOST}:${pathToString(cwd)}$`;
  }

  function echoCommand(raw) {
    const line = el("div", "line line--cmd");
    line.innerHTML =
      `<span class="prompt-inline">${escapeHtml(USER)}@${escapeHtml(HOST)}:${escapeHtml(pathToString(cwd))}$</span> ` +
      escapeHtml(raw);
    screen.appendChild(line);
  }

  // ---------- Commands ----------
  const commands = {
    help() {
      const rows = [
        ["help", "show this help"],
        ["about", "who is behind this site"],
        ["projects", "list projects"],
        ["skills", "list skills"],
        ["contact", "show contact info"],
        ["whoami", "print current user"],
        ["date", "print current date and time"],
        ["echo &lt;text&gt;", "print text"],
        ["ls [path]", "list directory contents"],
        ["cd &lt;path&gt;", "change directory"],
        ["pwd", "print working directory"],
        ["cat &lt;file&gt;", "show file contents"],
        ["clear", "clear the screen"],
        ["history", "show command history"],
        ["theme [name]", "set theme: default | amber | matrix | light"],
        ["banner", "print the welcome banner"],
        ["open &lt;url|github&gt;", "open a link in a new tab"],
        ["sudo &lt;cmd&gt;", "elevate privileges (just kidding)"],
        ["exit", "say goodbye"],
      ];
      let html = '<div class="tbl">';
      for (const [k, v] of rows) html += `<b>${k}</b><span>${v}</span>`;
      html += "</div>";
      printRaw(html);
    },

    about() {
      print(
        "I build small, fast, dependency-light web things.\n" +
        "This terminal is hand-rolled in vanilla HTML/CSS/JS.\n\n" +
        "Try: `projects`, `skills`, or `cat about.txt` from ~.",
      );
    },

    projects() {
      const items = [
        ["terminal-web", "An interactive terminal-style website (this one)."],
        ["wiki-min",     "A minimal flat-file markdown wiki."],
        ["focus-bar",    "A pomodoro timer that lives in the menu bar."],
      ];
      let html = '<div class="tbl">';
      for (const [k, v] of items) html += `<b>${k}</b><span>${v}</span>`;
      html += "</div>";
      printRaw(html);
    },

    skills() {
      printRaw(
        '<div class="tbl">' +
          '<b>languages</b><span>JavaScript, TypeScript, Python, Go, HTML, CSS</span>' +
          '<b>frontend</b><span>React, Vue, Vite, plain DOM, accessibility</span>' +
          '<b>backend</b><span>Node, Express, FastAPI, Postgres, Redis</span>' +
          '<b>tools</b><span>git, docker, linux, ci/cd, bash</span>' +
        '</div>'
      );
    },

    contact() {
      printRaw(
        '<div class="tbl">' +
          '<b>email</b><span>you@example.com</span>' +
          '<b>github</b><span><a href="https://github.com/Asatillo-2005" target="_blank" rel="noopener">github.com/Asatillo-2005</a></span>' +
        '</div>'
      );
    },

    whoami() { print(USER); },

    date() { print(new Date().toString()); },

    echo(args) { print(args.join(" ")); },

    pwd() { print(pathToString(cwd)); },

    ls(args) {
      const target = args[0] ? resolvePath(args[0]) : cwd;
      const node = getNode(target);
      if (!node) return print(`ls: cannot access '${args[0]}': No such file or directory`, "line--err");
      if (node.type !== "dir") return print(args[0] || pathToString(target));
      const names = Object.keys(node.children).sort();
      if (!names.length) return;
      const html = names.map(n => {
        const child = node.children[n];
        const isDir = child && child.type === "dir";
        return isDir
          ? `<b style="color:var(--accent)">${escapeHtml(n)}/</b>`
          : escapeHtml(n);
      }).join("   ");
      printRaw(html);
    },

    cd(args) {
      if (!args[0] || args[0] === "~") { cwd = ["~"]; return updatePrompt(); }
      const target = resolvePath(args[0]);
      const node = getNode(target);
      if (!node) return print(`cd: no such file or directory: ${args[0]}`, "line--err");
      if (node.type !== "dir") return print(`cd: not a directory: ${args[0]}`, "line--err");
      cwd = target;
      updatePrompt();
    },

    cat(args) {
      if (!args[0]) return print("cat: missing file operand", "line--err");
      const target = resolvePath(args[0]);
      const node = getNode(target);
      if (!node) return print(`cat: ${args[0]}: No such file or directory`, "line--err");
      if (node.type === "dir") return print(`cat: ${args[0]}: Is a directory`, "line--err");
      print(node);
    },

    clear() { screen.innerHTML = ""; },

    history() {
      if (!history.length) return print("(empty)");
      const html = history
        .map((h, i) => `<span class="line--muted">${String(i + 1).padStart(4, " ")}</span>  ${escapeHtml(h)}`)
        .join("<br>");
      printRaw(html);
    },

    theme(args) {
      const name = (args[0] || "").toLowerCase();
      const valid = ["default", "amber", "matrix", "light"];
      if (!name) {
        print("usage: theme <default|amber|matrix|light>", "line--muted");
        return;
      }
      if (!valid.includes(name)) {
        print(`theme: unknown theme '${name}'`, "line--err");
        return;
      }
      document.body.classList.remove("theme-amber", "theme-matrix", "theme-light");
      if (name !== "default") document.body.classList.add(`theme-${name}`);
      try { localStorage.setItem("term.theme", name); } catch (_) {}
      print(`theme set to ${name}`, "line--ok");
    },

    banner() { showBanner(); },

    open(args) {
      const target = args[0];
      if (!target) return print("usage: open <url|github>", "line--muted");
      const url = target === "github"
        ? "https://github.com/Asatillo-2005"
        : (/^https?:\/\//.test(target) ? target : "https://" + target);
      window.open(url, "_blank", "noopener");
      print(`opening ${url} ...`, "line--muted");
    },

    sudo(args) {
      const rest = args.join(" ") || "make-me-a-sandwich";
      print(`[sudo] password for ${USER}: ********`, "line--muted");
      setTimeout(() => print(`${USER} is not in the sudoers file. This incident will be reported.`, "line--err"), 350);
    },

    exit() {
      print("Goodbye! Refresh the page to come back.", "line--ok");
      input.disabled = true;
      input.placeholder = "session closed";
    },
  };

  // aliases
  commands["?"] = commands.help;
  commands["dir"] = commands.ls;
  commands["cls"] = commands.clear;

  // ---------- Banner ----------
  function showBanner() {
    const art =
"  _                      _             _ \n" +
" | |_ ___ _ __ _ __ ___ (_)_ __   __ _| |\n" +
" | __/ _ \\ '__| '_ ` _ \\| | '_ \\ / _` | |\n" +
" | ||  __/ |  | | | | | | | | | | (_| | |\n" +
"  \\__\\___|_|  |_| |_| |_|_|_| |_|\\__,_|_|\n";
    printRaw(`<pre class="banner">${escapeHtml(art)}</pre>`);
    print("Welcome to the terminal. Type `help` to see what's available.", "line--muted");
  }

  // ---------- History & input ----------
  const history = [];
  let histIdx = -1;
  let draft = "";

  function run(raw) {
    const line = raw.trim();
    if (!line) return;
    history.push(line);
    histIdx = history.length;

    const parts = line.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const cmd = (parts[0] || "").toLowerCase();
    const args = parts.slice(1).map(s => s.replace(/^["']|["']$/g, ""));

    if (commands[cmd]) {
      try { commands[cmd](args); }
      catch (e) { print(String(e && e.message || e), "line--err"); }
    } else {
      print(`${cmd}: command not found. Try \`help\`.`, "line--err");
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value;
    echoCommand(raw);
    input.value = "";
    run(raw);
  });

  // arrow-key history + tab completion
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      if (histIdx === history.length) draft = input.value;
      histIdx = Math.max(0, histIdx - 1);
      input.value = history[histIdx] ?? "";
      e.preventDefault();
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    } else if (e.key === "ArrowDown") {
      if (!history.length) return;
      histIdx = Math.min(history.length, histIdx + 1);
      input.value = histIdx === history.length ? draft : (history[histIdx] ?? "");
      e.preventDefault();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const value = input.value;
      const tokens = value.split(/\s+/);
      const last = tokens[tokens.length - 1] || "";
      let pool = [];
      if (tokens.length <= 1) {
        pool = Object.keys(commands);
      } else {
        const node = getNode(cwd);
        if (node && node.type === "dir") pool = Object.keys(node.children);
      }
      const matches = pool.filter(c => c.startsWith(last));
      if (matches.length === 1) {
        tokens[tokens.length - 1] = matches[0];
        input.value = tokens.join(" ") + (tokens.length === 1 ? " " : "");
      } else if (matches.length > 1) {
        echoCommand(value);
        printRaw(matches.map(escapeHtml).join("   "));
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      commands.clear();
    } else if (e.key === "c" && e.ctrlKey) {
      // simulate ^C
      echoCommand(input.value + "^C");
      input.value = "";
    }
  });

  // keep focus on the input when clicking anywhere in the terminal
  document.getElementById("terminal").addEventListener("click", () => {
    if (window.getSelection().toString()) return; // don't steal focus when copying
    input.focus();
  });

  // ---------- Boot ----------
  (function boot() {
    // restore theme
    try {
      const saved = localStorage.getItem("term.theme");
      if (saved && saved !== "default") document.body.classList.add(`theme-${saved}`);
    } catch (_) {}

    showBanner();
    print("Tip: try `help`, `ls`, `cat about.txt`, or `theme matrix`.\n", "line--muted");
    updatePrompt();
    input.focus();
  })();
})();
