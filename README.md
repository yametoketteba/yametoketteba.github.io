# ブブゼラ / Vuvuzela オフィシャルサイト

公開先：https://yametoketteba.github.io/

## 構成

- `content/`：文章、実績、料金、設定
- `templates/`：共通フッター
- `assets/`：共通デザイン、メニュー操作
- `scripts/build.mjs`：公開用ページ生成
- `.github/workflows/pages.yml`：GitHub Pagesへの自動公開
- `dist/`：生成ファイル

## 開発

Node.js 22以降を使用します。外部パッケージは不要です。

```sh
npm run build
npm run dev
```

`main`ブランチ更新後、GitHub Actionsがサイトを公開します。
