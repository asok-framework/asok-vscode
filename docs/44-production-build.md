# Production Build System

Asok provides a powerful, zero-dependency build pipeline designed to generate lean, optimized, and secure distributions for production environments. The `asok build` command handles everything from asset minification to bytecode compilation.

## The `asok build` Command

To generate a production-ready distribution of your project, run:

```bash
asok build
```

This command creates a new directory (default: `dist/`) containing a self-contained, optimized version of your project.

### What happens during the build?

1.  **Cloning**: The project structure is replicated into the output directory, excluding development artifacts like `venv`, `.git`, or `.asok`.
2.  **Asset Minification**: All JS and CSS files within `src/partials` are recursively minified using `esbuild`.
3.  **HTML Optimization**: Templates are minified to remove unnecessary whitespace and comments, significantly reducing TTFB.
4.  **Bytecode Compilation**: All Python source files are compiled into `.pyc` files. By default, the original `.py` files are removed to create a "locked" distribution.
5.  **Image Optimization**: If `IMAGE_OPTIMIZATION=true` is set, all project images are converted to WebP and originals are removed.
6.  **Production Config**: A `.env.production` file is generated with `DEBUG=false` and security defaults.

## Command Options

| Option | Description | Default |
| :--- | :--- | :--- |
| `--output`, `-o` | Specify the output directory name. | `dist` |
| `--keep-source` | Keep original `.py` files alongside `.pyc` files. | `False` |

## Deployment Workflow

Once the build is complete, your `dist/` folder is ready for deployment. You can preview it locally using:

```bash
cd dist
asok preview
```

> [!IMPORTANT]
> The `asok preview` command in the build folder correctly identifies `wsgi.pyc` as the entry point. In production environments (Gunicorn/Uvicorn), you should point your WSGI server to `wsgi:app`.

## Performance Benefits

By using `asok build`, you gain several performance advantages:

- **Zero Runtime Minification**: In production mode (`DEBUG=false`), Asok detects that templates are already optimized and skips on-the-fly minification, saving CPU cycles.
- **Fast Startup**: Bytecode compilation (`.pyc`) allows the Python interpreter to load modules faster.
- **Optimized Assets**: Small JS/CSS bundles and WebP images ensure faster page loads and lower bandwidth usage.
- **Security**: Shipping bytecode instead of source code adds a layer of obfuscation and prevents accidental source leaks.

## Requirements

The build system requires `esbuild` for asset minification. If not present, run:

```bash
asok assets --install
```

---
[← Previous: Static Versioning](43-static-versioning.md) | [Documentation](README.md) | [Next: Data Tables →](45-data-tables.md)
