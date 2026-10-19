# 上传到 GitHub · 完整步骤

> 适用环境：Windows + Git Bash / PowerShell + 本机路径 `F:\BuddyProject\简历`
> 当前状态：本地仓库已初始化（分支 `main`），55 个文件已暂存（约 1.9 MB），**只差「设置身份 → 提交 → 建远程仓库 → 推送」四步**。

---

## 0. 先说清楚：现在到哪一步了

| 事项 | 状态 |
|---|---|
| 本地 git 仓库 | ✅ 已初始化，分支 `main` |
| 待提交文件 | ✅ 55 个已暂存，共 1.9 MB |
| 忽略规则 | ✅ `node_modules`(269 MB)、`dist`、`.shots`、`.workbuddy`、`.run`、`.env` 均不入库 |
| 换行符规则 | ✅ `.gitattributes`：仓库内统一 LF，`.bat/.ps1` 保留 CRLF |
| 提交者身份 | ❌ 未配置（Git 全局 name/email 都是空的） |
| GitHub 远程仓库 | ❌ 未创建 |
| GitHub CLI (`gh`) | ❌ 未安装（本流程不需要它） |

**懒人版（熟练后只要这 5 条）**：

```bash
cd /f/BuddyProject/简历
git config user.name "你的名字" && git config user.email "你的邮箱"
git commit -m "feat: 简历工坊 v1.1"
git remote add origin https://github.com/<你的用户名>/resume-builder.git
git push -u origin main
```

下面是每一步的细节、可选项和排错。

---

## 1. 设置提交身份（只需一次）

Git 必须知道「这次提交是谁做的」，否则 `git commit` 会直接报错 `Please tell me who you are`。

```bash
cd /f/BuddyProject/简历

# 只对这一份仓库生效（推荐：不会污染你其它项目的提交身份）
git config user.name "Zhang San"
git config user.email "you@example.com"
```

**邮箱怎么填？** 两种选择：

| 选择 | 说明 |
|---|---|
| 真实邮箱 | 提交记录里公开可见，任何人都能查到 |
| GitHub 隐私邮箱（推荐） | 打开 GitHub → Settings → Emails → 勾选 **Keep my email addresses private**，页面上会给出形如 `12345678+username@users.noreply.github.com` 的地址，复制它填进去 |

验证：

```bash
git config --get user.name
git config --get user.email
```

> 如果想让所有项目都用同一身份，把上面前两行的 `git config` 改成 `git config --global`。

---

## 2. 首次提交

```bash
git status                # 看一眼：全是 "new file"，没有 node_modules / dist 才正常
git commit -m "feat: 简历工坊 v1.1 —— 模块化拖拽、7 套模板、矢量 PDF 导出"
git log --oneline         # 应该看到一条提交
```

**提交信息怎么写**（以后也用得上）：

```
<类型>: <一句话说明>

类型可选：
feat     新功能
fix      修 bug
docs     只改文档
style    只改样式/格式
refactor 重构（不改行为）
chore    杂项（依赖、脚本、配置）
```

提交后如果发现漏了文件，不用重新来：

```bash
git add .
git commit --amend --no-edit     # 合并进上一条提交
```

---

## 3. 在 GitHub 上创建远程仓库

1. 打开 https://github.com/new
2. 按下表填写：

| 字段 | 填什么 | 为什么 |
|---|---|---|
| **Repository name** | `resume-builder` | 远程仓库名建议用英文；本地目录叫「简历」不影响 |
| **Description** | `模块化拖拽简历生成器：7 套模板、头像上传、导出矢量 PDF` | 会显示在仓库标题下 |
| **Public / Private** | 想用免费的 GitHub Pages 就必须选 **Public** | Private 的 Pages 需要付费计划 |
| **Add a README file** | ❌ **不要勾** | 勾了远程会先有一条提交，推送时必然冲突 |
| **Add .gitignore** | ❌ **不要勾** | 本地已有，勾了会覆盖 |
| **Choose a license** | 可选（个人项目常用 MIT） | 后续也能加，见文末 |

3. 点 **Create repository**。
4. 跳转后的页面会显示一串命令 —— **不要照着它执行**（它假设你本地什么都没有）。按本文第 4 步来。

---

## 4. 关联远程仓库并推送

先拿到你的仓库地址，形如：

```
https://github.com/<你的用户名>/resume-builder.git
```

然后：

```bash
cd /f/BuddyProject/简历

git remote add origin https://github.com/<你的用户名>/resume-builder.git
git branch -M main                  # 确保分支名是 main（GitHub 默认分支）
git remote -v                       # 确认 origin 指向正确
git push -u origin main
```

`-u` 的作用：把本地 `main` 和远程 `origin/main` 绑定，以后直接 `git push` 就行。

### 认证方式三选一

**方式 A：浏览器登录（推荐，最省事）**

Git for Windows 自带 Git Credential Manager。第一次 `git push` 时会**自动弹出浏览器窗口**让你登录 GitHub，授权后凭据会存进 Windows 凭据管理器，之后不再询问。

看到弹出窗口 → 点 **Authorize** → 回到终端，推送会自动继续。

**方式 B：HTTPS + 个人访问令牌（PAT）**

如果没弹窗、或提示密码错误，GitHub 早已不支持用账号密码推送：

1. 打开 https://github.com/settings/tokens → **Tokens (classic)** → **Generate new token (classic)**
2. Note 随便写（如 `resume-builder`），Expiration 选 30 天或 90 天
3. 勾选 scope：**`repo`**（整块勾上即可）
4. 点 Generate，复制生成的 `ghp_xxxxxxxx`（**只显示一次**）
5. 回到终端重新 `git push`：
   - `Username for 'https://github.com':` → 填 GitHub 用户名
   - `Password for 'https://...':` → **粘贴刚才的 token**（输入时不显示字符，粘贴后直接回车）

> ⚠️ 不要把 token 写进远程地址（`https://token@github.com/...`），一旦仓库泄露 token 就跟着泄露。要改地址用 `git remote set-url origin <地址>`。

**方式 C：SSH 密钥（一次配置，长期免密）**

```bash
ssh-keygen -t ed25519 -C "you@example.com"     # 一路回车，用默认路径、空密码
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
clip < ~/.ssh/id_ed25519.pub                    # 公钥已复制到剪贴板
```

打开 https://github.com/settings/keys → **New SSH key** → Title 随便写 → Key 粘贴 → **Add SSH key**。

测试并改用 SSH 地址：

```bash
ssh -T git@github.com
# 成功会显示：Hi <用户名>! You've successfully authenticated...

git remote set-url origin git@github.com:<你的用户名>/resume-builder.git
git push -u origin main
```

---

## 5. 验证是否真的传上去了

1. 刷新仓库页面，应看到：`README.md`（带预览图）、`src/`、`docs/`、`package.json` 等
2. 点开 `src/` → 应看到 `blocks/`、`domain/` 等目录
3. **确认没有误传**：仓库首页看不到 `node_modules`、`dist`、`.shots`；本地再核对一遍：

```bash
git ls-files | grep -E "node_modules|dist/|\.env|\.shots" ; echo "（无输出 = 干净）"
```

4. 顶部会显示提交条数与分支名 `main`。

---

## 6. 以后改完怎么更新（日常三条命令）

```bash
cd /f/BuddyProject/简历
git add .
git commit -m "fix: 修正侧栏头像换行"
git push
```

看改了什么、准备提交什么：

```bash
git status          # 哪些文件改了
git diff            # 具体改了什么
git log --oneline -5
```

撤销还没提交的改动（危险操作，确认后再用）：

```bash
git restore <文件路径>       # 丢弃某个文件的改动
git restore --staged <文件>  # 只把它撤出暂存区，改动保留
```

---

## 7. 报错对照表

| 报错 | 原因 | 解决 |
|---|---|---|
| `Please tell me who you are` | 没配提交身份 | 回到第 1 步 |
| `remote: Support for password authentication was removed` | 用账号密码推送 | 改用方式 A 或 B（PAT） |
| `fatal: remote origin already exists` | 已经加过 origin | `git remote set-url origin <新地址>` |
| `Updates were rejected because the remote contains work...` | 远程有本地没有的提交（建仓库时勾了 README） | `git pull --rebase origin main` 后重新 push |
| `fatal: refusing to merge unrelated histories` | 两条独立历史 | `git pull origin main --allow-unrelated-histories` |
| `Permission denied (publickey)` | SSH 公钥没加到 GitHub | 重新走方式 C 的 `ssh -T` 测试 |
| `error: src refspec main does not match any` | 还没提交过 / 分支名不是 main | 先 `git commit`，再 `git branch -M main` |
| `fatal: not a git repository` | 不在项目目录 | `cd /f/BuddyProject/简历` |
| `Unable to create .../index.lock: File exists` | 上次 git 进程异常退出 | 删掉 `.git/index.lock` 再执行 |
| 中文文件名显示成 `\346\226\207...` | Git 默认转义非 ASCII | `git config --global core.quotepath false` |
| `LF will be replaced by CRLF` 警告 | Windows 换行符转换提示 | 无害，`.gitattributes` 已统一规则，可忽略 |
| 文件超过 100 MB 推不上去 | GitHub 单文件硬限制 | 确认没把二进制/数据包加进仓库；`git rm --cached <文件>` 并补 `.gitignore`；确实需要则用 Git LFS |

---

## 8. 可选：发布成在线网页（GitHub Pages，免费）

本项目是纯静态 SPA，可以直接上线，得到一个 `https://<用户名>.github.io/resume-builder/` 的链接。

`vite.config.ts` 里已经设了 `base: './'`，产物用相对路径，挂在子路径下也能正常加载，**不用再改配置**。

**步骤**

1. 仓库 → **Settings** → 左侧 **Pages** → Source 选 **GitHub Actions**
2. 在项目里新建 `.github/workflows/deploy.yml`，内容：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

3. 提交并推送，仓库 **Actions** 标签页会看到构建跑起来
4. 跑完后在 Settings → Pages 顶部会给出网址

**两个注意点**

- 线上版本和本地版本的数据是**分开的**（浏览器按域名隔离本地存储），打开线上链接是示例简历，需要重新填写
- GitHub Pages 只托管静态文件，本项目本来就不需要后端，所以功能完整可用

---

## 9. 提交前自查清单

- [ ] `git status` 里没有 `node_modules`、`dist`、`.env`、`.shots`
- [ ] `git ls-files | grep -E "node_modules|\.env"` 无输出
- [ ] 代码里没有写死的密钥 / token（本项目无后端，正常不会有）
- [ ] `npm run build` 能通过（构建不过的代码不建议推上去）
- [ ] README 里的图片路径能正常显示
- [ ] 仓库名、Description 填好
- [ ] 决定好 Public / Private（要用 Pages 就 Public）

---

## 10. 可选：补一个开源许可证

个人项目想要「别人可以自由使用但保留署名」，用 MIT：

1. 仓库页面 → **Add file** → **Create new file**
2. 文件名填 `LICENSE`
3. GitHub 会提示 **Choose a license template** → 选 MIT → 填年份和姓名 → 提交

---

## 附：本项目当前会入库的 55 个文件

```
根目录         .gitattributes  .gitignore  README.md  index.html
              package.json  package-lock.json  tsconfig.json  vite.config.ts
              start.bat  stop.bat
scripts/      dev.ps1
public/       favicon.svg
docs/         00-SE启动方案.md  01-上传到GitHub完整步骤.md  images/*.png
src/          40 个 .ts / .tsx（domain / blocks / store / features / components / styles / lib）
```

不会入库（被 `.gitignore` 挡住）：`node_modules/`（269 MB）、`dist/`（构建产物）、`.shots/`（测试截图）、`.run/`（启停 PID 与日志）、`.workbuddy/`（本地协作数据）、`.env*`。
