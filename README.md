This project is based on [GitHub@SomiaWhiteRing/game-grid](https://github.com/SomiaWhiteRing/game-grid),
which was originally released under the MIT License.

`Copyright (c) 2025 苍旻白轮`

The original MIT License applies to the original portions
of the codebase.

```LICENSE
MIT License

Copyright (c) 2025 苍旻白轮

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

# ＡＣＧＭＮ＋ Grid - ＡＣＧＭＮ＋生涯个人喜好表

**Use for free! → [Online Editor](https://acgmn-grid.vercel.app/)**

## 〇、摘要

###### ＊[游戏生涯个人喜好表的开源复刻版](https://github.com/SomiaWhiteRing/game-grid)［公元２０２５年１１月１３日（ＵＴＣ＋０９:００，東京）］的ＡＣＧＭＮ＋ Fork 版＊

生成你自己的ＡＣＧＭＮ＋生涯个人喜好表！

标题，名称，全部可以自由定义！

![示例图](screenshot/example.png)

### 欢迎Fork！

在遵守MIT License的前提下，欢迎自由的改写表格内容或自定义数据源进行分发。  
如果愿意，可以将自己创作的表格在原作[discussions](https://github.com/SomiaWhiteRing/gamegrid/discussions/2)中留言，原作[苍旻白轮（Github@SomiaWhiteRing）](https://github.com/SomiaWhiteRing)さん看到后会更新在项目主页！

## 一、快速开始（本地部署）

克隆仓库并安装依赖项：

```bash
git clone https://github.com/yourusername/gamegrid.git
cd gamegrid
npm install
```

运行开发服务器：

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 二、环境变量（本地部署）
### A. 创建 `.env.local` 文件
在本地根目录文件夹下创建`.env.local`文件，添加以下配置：

```bash
# SteamGridDB API配置
# 获取方式：https://www.steamgriddb.com/profile/preferences/api
STEAMGRIDDB_API_KEY=your_steamgriddb_api_key

# Bangumi API配置
# 获取方式：https://bgm.tv/dev/app
BANGUMI_ACCESS_TOKEN=your_bangumi_access_token
# User Agent格式示例：YourAppName/1.0 (https://yourwebsite.com) your@email.com
BANGUMI_USER_AGENT=GameGrid/1.0 (https://github.com/yourusername/yourrepo)

# Google Analytics配置（可选）
# 获取方式：https://analytics.google.com/
# 格式：G-XXXXXXXXXX
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

**需要在项目根目录手动创建 `.env.local` 文件。这个文件通常不会被提交到Git仓库（在 `.gitignore` 中），所以在项目里找不到是正常的。**

### B. 获取各个 API 密钥

- **SteamGridDB API Key**:
  1. 访问 https://www.steamgriddb.com/
  1. 注册并登录
  1. 进入 Profile → Preferences → API
  1. 生成 API Key

- **Bangumi Access Token:**
  1. 访问 https://bgm.tv/
  1. 登录你的账号
  1. 进入 https://bgm.tv/dev/app 或访问 [Bangumi API](https://bangumi.github.io/api/#/%E6%9D%A1%E7%9B%AE/getCalendar)
  1. 创建一个新应用（App）
  1. 获取 Access Token
  1. 设置合适的 User Agent（参考[bangumiUA指南](https://github.com/bangumi/api/blob/master/docs-raw/user%20agent.md)）
      1. 格式：`应用名称/版本号 (网址) 联系邮箱`
      1. 示例：`GameGrid/1.0 (https://github.com/username/gamegrid) your@email.com`
      1. 这是 Bangumi API 的规范要求，用于标识你的应用

- **Google Analytics ID（可选）:**
  1. 访问 https://analytics.google.com/
  1. 创建账号和数据流
  1. 获取衡量 ID（格式：`G-XXXXXXXXXX`）
  1. 仅在生产环境启用，不配置则不启用追踪

### C. 填写配置
将获取到的真实密钥替换模板中的占位符：
```bash
STEAMGRIDDB_API_KEY=abc123xyz456  # 你的真实密钥
BANGUMI_ACCESS_TOKEN=def789ghi012  # 你的真实token
BANGUMI_USER_AGENT=GameGrid/1.0 (https://github.com/yourname/repo) your@email.com
```

### D. 重启开发服务器
修改 `.env.local` 后需要重启 Next.js 开发服务器才能生效：
```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

### E. 注意事项：
- `.env.local` 不应该提交到 Git（确保它在 `.gitignore` 中）
- 这些是私密信息，不要分享给他人
- 如果部署到生产环境（如Vercel），需要在平台的环境变量设置中添加这些配置


## 三、部署

### A. Vercel 部署（推荐）

#### I. Fork 本仓库到你的 GitHub 账号
#### II. 在 [Vercel](https://vercel.com) 导入项目
#### III. 在项目设置中添加环境变量`STEAMGRIDDB_API_KEY`、`BANGUMI_ACCESS_TOKEN`、`BANGUMI_USER_AGENT`、`NEXT_PUBLIC_GA_ID`（可选，用于 Google Analytics 追踪）（见上一步）：
  
##### 方法一：通过Vercel Dashboard（推荐）

  1. **进入项目设置**
      1. 登录 https://vercel.com/
      1. 选择你导入的项目
      1. 点击顶部的 **Settings** 标签

  2. **添加环境变量**
      1. 在左侧菜单找到 **Environment Variables**
      1. 点击进入环境变量设置页面

  3. **逐个添加变量**
      1. 对每个环境变量：
         - **Key (名称)**：输入变量名，如 `STEAMGRIDDB_API_KEY`
         - **Value (值)**：输入对应的API密钥
         - **Environment (环境)**：选择要应用的环境
           - ✅ **Production** (生产环境 - 必选)
           - ✅ **Preview** (预览环境 - 建议选)
           - ✅ **Development** (开发环境 - 可选)
      2. 点击 **Add** 或 **Save**

5. **需要添加的环境变量**
   ```
   STEAMGRIDDB_API_KEY = your_steamgriddb_api_key
   BANGUMI_ACCESS_TOKEN = your_bangumi_access_token
   BANGUMI_USER_AGENT = GameGrid/1.0 (https://your-vercel-url.vercel.app) your@email.com
   NEXT_PUBLIC_GA_ID = your_google_analytics_id (可选)
   ```

6. **重新部署**
      1. 添加完所有环境变量后
      1. 进入 **Deployments** 标签
      1. 找到最新的部署
      1. 点击右侧的三个点 `...` → **Redeploy**
      1. 或者推送新的commit到GitHub自动触发部署

##### 方法二：通过Vercel CLI

如果你安装了Vercel CLI：

```bash
# 安装Vercel CLI (如果还没安装)
npm i -g vercel

# 登录
vercel login

# 进入项目目录，添加环境变量
vercel env add STEAMGRIDDB_API_KEY
# 然后按提示输入值和选择环境

# 或者从.env.local批量导入
vercel env pull .env.local
```

###### 验证环境变量

部署完成后，你可以：
1. 查看部署日志，确认没有"环境变量缺失"的错误
2. 访问你的网站，测试Bangumi搜索功能是否正常工作
3. 在Vercel Dashboard的 **Environment Variables** 页面查看已添加的变量（值会被隐藏）

###### 注意事项：

- ⚠️ 以 `NEXT_PUBLIC_` 开头的变量会暴露到浏览器端，其他变量只在服务器端可用
- 🔒 已添加的环境变量值在Dashboard中会被隐藏（显示为 `***`）
- 🔄 修改环境变量后必须重新部署才能生效
- 📝 `BANGUMI_USER_AGENT` 建议填写你的Vercel域名，格式如：
  ```
  GameGrid/1.0 (https://your-project.vercel.app) your@email.com
  ```

添加完成后，你的应用就可以正常调用Bangumi和SteamGridDB的API了！

#### IV. 部署完成

### B. 其他平台部署

确保在部署平台的环境变量配置中添加上述所有必需的环境变量。Google Analytics ID 为可选配置，不配置则不会启用追踪功能。

## 四、开发历程

本项目原作使用 GitHub Copilot 与 Codex 辅助开发，提高了开发效率和代码质量。

本项目二次创作使用 Claude Sonnet 4.5 改进，拓展了 Bangumi 番组计划的 API 查询范围，优化了作品名称的表现方式。

## 五、致谢

- 特别感谢[游戏生涯个人喜好表（已下线）](https://gamegrid.azurewebsites.net)项目的灵感，本项目原作是对该创意的致敬。
- 感谢 [SteamGridDB](https://www.steamgriddb.com/) 和 [Bangumi](https://bgm.tv/) 提供的API支持。
- 感谢原作[苍旻白轮（Github@SomiaWhiteRing）](https://github.com/SomiaWhiteRing)さん的开源。

## 六、许可证

MIT许可证 - 详情请参阅[LICENSE](LICENSE)文件。
