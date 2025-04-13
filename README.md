# 🧠 React Helmet Pro

**React Helmet Pro** is an advanced, modular, and SSR compatible head manager for React applications. It provides a clean and powerful API for dynamically managing `<title>`, `<meta>`, `<link>`, `<script>`, structured data, favicons, analytics, and security headers designed for real world production use.

> Robust head management for SEO, analytics, and SSR made simple.

---

## 🚀 Features

- ⚛️ Dynamic `<title>`, `<meta>`, `<link>`, `<script>` injection
- 📦 JSON-LD Structured Data support
- 📊 Google Analytics integration
- 🌐 Favicons & SEO helpers
- 🔐 Security meta tags (CSP, nosniff, etc.)
- 🌍 SSR-friendly with `collectHeadTags()`
- 🧱 Middleware support for reusable head logic
- 🔁 Context API for global head state
- 🔌 TypeScript support out of the box

---

## 📦 Installation

```bash
# or with npm
npm install react-helmet-pro
# with pnpm
pnpm add react-helmet-pro
# or with yarn
yarn add react-helmet-pro

```

---

## 🧠 Basic Usage

### Wrap Your App

```tsx
import { HelmetProvider } from 'react-helmet-pro';

function App() {
  return (
    <HelmetProvider>
      <MainRouter />
    </HelmetProvider>
  );
}
```

### Add Title and Meta Tags

```tsx
import { Head } from 'react-helmet-pro';

<Head
  title="About Us"
  meta={[
    { name: 'description', content: 'Learn about our company' },
    { name: 'keywords', content: 'company, team, about' },
  ]}
/>
```

### Add JSON-LD Structured Data

```tsx
import { StructuredData } from 'react-helmet-pro';

<StructuredData
  json={{
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'React Helmet Pro Inc.',
    url: 'https://reacthelmetpro.dev',
  }}
/>
```

### Add Google Analytics

```tsx
import { Analytics } from 'react-helmet-pro';

<Analytics type="gtag" id="G-XXXXXXXXXX" />
```

---

## 🧩 Middleware Example

You can define reusable middleware functions to extend or modify head data.

```ts
// middleware/withSiteSuffix.ts
export const withSiteSuffix = (head) => {
  if (head.title) {
    return { ...head, title: `${head.title} | My Awesome Site` };
  }
  return head;
};
```

Apply it in your component:

```tsx
import { useHeadMiddleware } from 'react-helmet-pro';
import { withSiteSuffix } from './middleware/withSiteSuffix';

useHeadMiddleware(withSiteSuffix);
```

---

## 📄 Components API

### `<Head />`

| Prop   | Type                        | Description              |
|--------|-----------------------------|--------------------------|
| title  | `string`                    | Sets the page title      |
| meta   | `Array<{ name: string; content: string }>` | Injects meta tags |

---

### `<StructuredData />`

| Prop | Type     | Description              |
|------|----------|--------------------------|
| json | `object` | JSON-LD structured data  |

---

### `<Favicon />`

| Prop | Type     | Description         |
|------|----------|---------------------|
| href | `string` | Path to favicon.ico |

---

### `<Analytics />`

| Prop | Type         | Description               |
|------|--------------|---------------------------|
| type | `'gtag'`     | Currently only supports GTag |
| id   | `string`     | Your Google Analytics ID  |

---

### `<SecurityMeta />`

Injects security-related meta tags like CSP, XSS protection, nosniff headers, etc.

---

## 🧪 SSR Support

### Server-side Head Tag Extraction

```tsx
import { collectHeadTags } from 'react-helmet-pro';

const headTags = collectHeadTags(/* JSX head elements */);
// Use this to inject into SSR-rendered HTML
```

---

## 🧪 Testing

Test with Jest + React Testing Library.

```bash
npm run test
```

Example test:

```tsx
render(<Head title="Test Page" />);
expect(document.title).toBe("Test Page");
```

---

## 🧑‍💻 Contributing

We welcome all contributions!  
To get started:

```bash
git clone https://github.com/lahiruudayakumara/react-helmet-pro.git
cd react-helmet-pro
pnpm install
pnpm run dev
```

Please open an issue or pull request if you find bugs or have feature requests.

---

## 📬 Contact

- 📧 Email: [lahiruudayakumara.info@gmail.com](mailto:lahiruudayakumara.info@gmail.com)
- 🌐 Website: [https://lahiruudayakumara.me](https://lahiruudayakumara.me)

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 💡 Credits

Inspired by [React Helmet](https://github.com/nfl/react-helmet), but rebuilt for modern apps with middleware, SSR, and context extensibility.
