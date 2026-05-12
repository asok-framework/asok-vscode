import * as vscode from 'vscode';

let terminal: vscode.Terminal | undefined;

/**
 * Gets or creates the Asok CLI terminal
 */
function getTerminal() {
	if (!terminal || terminal.exitStatus !== undefined) {
		terminal = vscode.window.createTerminal('Asok CLI');
	}
	return terminal;
}

/**
 * Runs an Asok command in the terminal
 */
function runAsokCommand(command: string) {
	const t = getTerminal();
	t.show();
	t.sendText(`asok ${command}`);
}

/**
 * Documentation for Asok Template tags, filters, directives, and live updates
 */
const ASOK_DOCS: Record<string, string> = {
	// Delimiters
	'{{': '### Asok Variable\nOutput the value of an expression. Content is auto-escaped unless the `safe` filter is used.\n\n`{{ user.name }}`',
	'{%': '### Asok Tag\nTemplate control structure (if, for, block, etc.).',
	
	// Tags
	'if': '### Asok If\nConditional rendering block.\n\n```html\n{% if user.is_admin %}\n  <p>Welcome Admin</p>\n{% elif user.is_authenticated %}\n  <p>Welcome {{ user.name }}</p>\n{% else %}\n  <a href="/login">Login</a>\n{% endif %}\n```',
	'for': '### Asok For\nIterate over a sequence. Provides access to the `loop` variable.\n\n```html\n{% for item in items %}\n  <li>{{ loop.index }}: {{ item }}</li>\n{% endfor %}\n```',
	'extends': '### Asok Extends\nInherit from a base template. Must be the first tag in the file.\n\n```html\n{% extends "html/base.html" %}\n```',
	'block': '### Asok Block\nDefine a replaceable block in a template. Used for inheritance and SPA partial updates.\n\n```html\n{% block main %}\n  ...\n{% endblock %}\n```',
	'include': '### Asok Include\nInclude another template file relative to `src/partials/`.\n\n```html\n{% include "html/navbar.html" %}\n```',
	'macro': '### Asok Macro\nDefine a reusable template function.\n\n```html\n{% macro input(name, label="") %}\n  <label>{{ label }} <input name="{{ name }}"></label>\n{% endmacro %}\n```',
	'call': '### Asok Call Block\nCall a macro and pass a block of content to it via `caller()`.\n\n```html\n{% call card("Title") %}\n  <p>Body content</p>\n{% endcall %}\n```',
	'set': '### Asok Set\nAssign a value to a variable or capture a block of content.\n\n```html\n{% set total = items | length %}\n{% set message %}\n  <p>Hello World</p>\n{% endset %}\n```',
	'filter': '### Asok Filter Block\nApply one or more filters to an entire block of template content.\n\n```html\n{% filter upper | truncate(100) %}\n  Large text block...\n{% endfilter %}\n```',
	'do': '### Asok Do\nExecute an expression without outputting anything. Useful for side effects.\n\n`{% do request.session.set("visited", True) %}`',
	'with': '### Asok With\nCreate a new local scope for variables.\n\n```html\n{% with total = items | length %}\n  <p>{{ total }} items</p>\n{% endwith %}\n```',
	'break': '### Asok Break\nExit a loop early.',
	'continue': '### Asok Continue\nSkip to the next iteration of a loop.',
	'autoescape': '### Asok Autoescape\nControl HTML auto-escaping for a block.\n\n`{% autoescape false %} ... {% endautoescape %}`',

	// Filters
	'upper': '### Filter: upper\nConvert string to uppercase.\n\n`{{ name | upper }}`',
	'lower': '### Filter: lower\nConvert string to lowercase.\n\n`{{ name | lower }}`',
	'capitalize': '### Filter: capitalize\nCapitalize first character.\n\n`{{ "hello" | capitalize }}` -> `Hello`',
	'title': '### Filter: title\nConvert string to title case.\n\n`{{ "hello world" | title }}` -> `Hello World`',
	'truncate': '### Filter: truncate\nTruncate a string to a specific length.\n\n`{{ text | truncate(50) }}`',
	'replace': '### Filter: replace\nReplace occurrences of a substring.\n\n`{{ text | replace("old", "new") }}`',
	'join': '### Filter: join\nJoin list elements into a string.\n\n`{{ items | join(", ") }}`',
	'default': '### Filter: default\nProvide a default value if the variable is empty or undefined.\n\n`{{ value | default("N/A") }}`',
	'length': '### Filter: length\nReturn the length of a sequence or mapping.\n\n`{{ items | length }}`',
	'safe': '### Filter: safe\nMark string as safe (trusted HTML), preventing automatic escaping.',
	'tojson': '### Filter: tojson\nConvert a variable to a JSON string.\n\n`{{ data | tojson }}`',
	'intcomma': '### Filter: intcomma\nAdd thousands separators to a number.\n\n`{{ 1000 | intcomma }}` -> `1,000`',
	'time_ago': '### Filter: time_ago\nFormat a date/datetime as human-readable relative time.\n\n`{{ post.created_at | time_ago }}` -> `2 hours ago`',
	'filesize': '### Filter: filesize\nFormat bytes into a human-readable file size.\n\n`{{ size | filesize }}` -> `1.2 MB`',
	'duration': '### Filter: duration\nFormat seconds into a human-readable duration.\n\n`{{ 3660 | duration }}` -> `1h 1m`',
	'decode_base64': '### Filter: decode_base64\nConvert a base64 string into an `<img>` tag.\n\n`{{ signature | decode_base64(class="w-32") }}`',

	// Tests
	'defined': '### Test: defined\nTrue if the variable is defined and not empty.\n\n`{% if user is defined %}`',
	'undefined': '### Test: undefined\nTrue if the variable is None or an empty string.',
	'none': '### Test: none\nCheck if a value is exactly `None`.',
	'true': '### Test: true\nCheck if a value is exactly `True`.',
	'false': '### Test: false\nCheck if a value is exactly `False`.',
	'even': '### Test: even\nTrue if the number is even.',
	'odd': '### Test: odd\nTrue if the number is odd.',
	'mapping': '### Test: mapping\nTrue if the value is a dictionary (mapping).',
	'sequence': '### Test: sequence\nTrue if the value is a list or tuple (sequence).',
	'iterable': '### Test: iterable\nTrue if the value can be iterated over.',

	// Directives (asok-*)
	'asok-state': '### Directive: asok-state\nDefine reactive local state for a component scope. Value must be a JS object literal.\n\n```html\n<div asok-state="{ count: 0 }">\n  <button asok-on:click="count++">+</button>\n</div>\n```',
	'asok-text': '### Directive: asok-text\nUpdate element text content reactively.\n\n`<span asok-text="count"></span>`',
	'asok-show': '### Directive: asok-show\nToggle visibility using `display: none` based on expression truthiness.',
	'asok-hide': '### Directive: asok-hide\nHide element if expression is truthy.',
	'asok-class': '### Directive: asok-class\nDynamic class binding. Accepts a string, object, or array expression.\n\n`<div asok-class="{ "active": isOpen }"></div>`',
	'asok-model': '### Directive: asok-model\nTwo-way data binding for form inputs.\n\n`<input asok-model="name">`',
	'asok-on': '### Directive: asok-on\nListen to DOM events. Supports modifiers like `.prevent`, `.stop`, `.debounce-300`, `.outside`.\n\n`<button asok-on:click="save()">Save</button>`',
	'asok-for': '### Directive: asok-for\nLoop through data in the browser. Use on a `<template> tag.\n\n```html\n<template asok-for="item in items">\n  <li asok-text="item"></li>\n</template>\n```',
	'asok-if': '### Directive: asok-if\nConditional browser-side rendering. Use on a `<template>` tag.',
	'asok-elif': '### Directive: asok-elif\nElse-if condition for `asok-if`. Use on a `<template>` tag.',
	'asok-else': '### Directive: asok-else\nElse condition for `asok-if`. Use on a `<template>` tag.',
	'asok-cloak': '### Directive: asok-cloak\nHide the element until the Asok runtime is ready.',
	'asok-teleport': '### Directive: asok-teleport\nRender content in a different DOM location.\n\n`<template asok-teleport="#modals">...</template>`',
	'asok-fetch': '### Directive: asok-fetch\nDeclarative GET request. Updates component state with JSON response automatically.',
	'asok-ref': '### Directive: asok-ref\nGet a reference to an element, accessible via `$refs`.\n\n`<input asok-ref="myInput">`',
	'asok-init': '### Directive: asok-init\nRun an expression when the element is initialized.',
	'asok-transition': '### Directive: asok-transition\nApply animations during DOM updates. Values: `fade`, `slide`, `scale`.\n\n`<div asok-transition="fade 300"></div>`',

	// Live Updates (data-*)
	'data-block': '### Live Update: data-block\nSpecify which template block to replace with server-side HTML.\n\n`<div data-block="results"></div>`',
	'data-url': '### Live Update: data-url\nSpecify the URL for a Live Update request (if not a form or link).',
	'data-trigger': '### Live Update: data-trigger\nSpecify the event that triggers the update. Supports `every 5s` for polling.\n\n`<div data-trigger="every 10s"></div>`',
	'data-swap': '### Live Update: data-swap\nSpecify how to swap the HTML response. Default: `innerHTML`.\n\nValues: `outerHTML`, `beforebegin`, `afterbegin`, `beforeend`, `afterend`, `delete`, `none`.',
	'data-push-url': '### Live Update: data-push-url\nUpdate browser history after a successful update.',
	'data-subscribe': '### Live Update: data-subscribe\nSubscribe to real-time model changes via WebSockets.\n\n`<div data-subscribe="model:Post:123"></div>`',

	// Reactive Components (ws-*)
	'ws-click': '### Reactive: ws-click\nTrigger a server-side component method on click via WebSockets.\n\n`<button ws-click="increment">Add</button>`',
	'ws-input': '### Reactive: ws-input\nTrigger a server-side component method on input via WebSockets.',
	'ws-submit': '### Reactive: ws-submit\nTrigger a server-side component method on form submission.',

	// Template helpers
	'$store': '### Special Variable: $store\nAccess the global reactive store.',
	'$refs': '### Special Variable: $refs\nAccess DOM elements marked with `asok-ref`.',
	'loop.index': '### Loop: index\n1-based index (1, 2, 3...).',
	'loop.index0': '### Loop: index0\n0-based index (0, 1, 2...).',
	'loop.first': '### Loop: first\nTrue if first iteration.',
	'loop.last': '### Loop: last\nTrue if last iteration.',
	'loop.length': '### Loop: length\nTotal number of items.',
	'$el': '### Special Variable: $el\nAccess the current DOM element.',
	'$event': '### Special Variable: $event\nAccess the native DOM event object (only in event handlers).',
	'$nextTick': '### Special Variable: $nextTick(fn)\nWait for the next DOM update cycle before running the function.'
};

/**
 * Extension activation entry point
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Asok VS Code extension is now active!');

	// Language Status Items
	const langs = ['html', 'asok-html'];
	
	const htmlStatus = vscode.languages.createLanguageStatusItem('asok.html.status', { language: 'html' });
	htmlStatus.text = '$(rocket) Asok';
	htmlStatus.detail = 'Asok Framework Support';
	htmlStatus.command = { command: 'asok.make', title: 'Asok: Make...' };

	const pyStatus = vscode.languages.createLanguageStatusItem('asok.python.status', { language: 'python' });
	pyStatus.text = '$(rocket) Asok';
	pyStatus.detail = 'Asok Framework Support';
	pyStatus.command = { command: 'asok.make', title: 'Asok: Make...' };

	// Hover Provider for HTML Template tags and attributes
	const hoverProvider = vscode.languages.registerHoverProvider(langs, {
		provideHover(document, position) {
			// Updated regex to catch directives (asok-on:click), live updates (data-swap), and special variables ($store)
			const range = document.getWordRangeAtPosition(position, /\{%|\{\{|[a-zA-Z0-9_$.:-]+/);
			if (!range) {
				return null;
			}
			
			const text = document.getText(range);
			
			// Try exact match first
			if (ASOK_DOCS[text]) {
				return new vscode.Hover(new vscode.MarkdownString(ASOK_DOCS[text]));
			}

			// Try matching the prefix for dynamic attributes (e.g., asok-on:click -> asok-on)
			const prefixMatch = text.match(/^(asok-[a-z]+|data-[a-z-]+|ws-[a-z]+)/);
			if (prefixMatch && ASOK_DOCS[prefixMatch[1]]) {
				return new vscode.Hover(new vscode.MarkdownString(ASOK_DOCS[prefixMatch[1]]));
			}

			return null;
		}
	});

	// Helper for "make" commands
	const registerMakeCommand = (cmd: string, type: string, prompt: string) => {
		return vscode.commands.registerCommand(cmd, async () => {
			const name = await vscode.window.showInputBox({
				prompt: prompt,
				placeHolder: 'e.g. BlogPost'
			});
			if (name) {
				runAsokCommand(`make ${type} ${name}`);
			}
		});
	};

	// Auto-enable Emmet for Asok HTML
	const emmetConfig = vscode.workspace.getConfiguration('emmet');
	const includeLanguages: any = emmetConfig.get('includeLanguages', {});
	
	if (!includeLanguages['asok-html']) {
		vscode.window.showInformationMessage('Enable Emmet for Asok HTML?', 'Enable').then(selection => {
			if (selection === 'Enable') {
				includeLanguages['asok-html'] = 'html';
				emmetConfig.update('includeLanguages', includeLanguages, vscode.ConfigurationTarget.Global);
			}
		});
	}

	// Completion Provider for asok-html to restore HTML tags
	const completionProvider = vscode.languages.registerCompletionItemProvider('asok-html', {
		provideCompletionItems(document, position) {
			// If we are likely typing an attribute (after a space inside a tag)
			const htmlAttributes = [
				'class', 'id', 'style', 'title', 'lang', 'dir', 'hidden',
				'src', 'href', 'alt', 'type', 'value', 'placeholder', 
				'name', 'target', 'rel', 'width', 'height', 'method', 'action',
				'required', 'readonly', 'disabled', 'checked', 'selected', 'autofocus'
			];

			const tags = [
				'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
				'ul', 'ol', 'li', 'img', 'form', 'input', 'button', 'select', 'option', 
				'textarea', 'label', 'table', 'tr', 'td', 'th', 'section', 'header', 
				'footer', 'main', 'nav', 'aside', 'template', 'slot', 'canvas', 'svg'
			];

			const linePrefix = document.lineAt(position).text.substring(0, position.character);
			
			// Detect if we are inside a tag but not in a value
			// Logic: find the last '<', check if there is no '>' after it
			const lastOpenTag = linePrefix.lastIndexOf('<');
			const lastCloseTag = linePrefix.lastIndexOf('>');
			
			if (lastOpenTag > lastCloseTag) {
				return [
					...htmlAttributes.map(attr => {
						const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
						item.insertText = new vscode.SnippetString(`${attr}="$1"$0`);
						return item;
					}),
					...Object.keys(ASOK_DOCS).map(directive => {
						const item = new vscode.CompletionItem(directive, vscode.CompletionItemKind.Field);
						item.documentation = new vscode.MarkdownString(ASOK_DOCS[directive as keyof typeof ASOK_DOCS]);
						item.insertText = new vscode.SnippetString(`${directive}="$1"$0`);
						if (directive === 'asok-cloak') item.insertText = directive;
						return item;
					})
				];
			}

			// Suggest tags
			return tags.map(tag => {
				const item = new vscode.CompletionItem(tag, vscode.CompletionItemKind.Class);
				item.insertText = new vscode.SnippetString(`<${tag}>\n\t$0\n</${tag}>`);
				if (['img', 'input', 'br', 'hr', 'meta', 'link'].includes(tag)) {
					item.insertText = new vscode.SnippetString(`<${tag} $0>`);
				}
				return item;
			});
		}
	});

	// Register all
	context.subscriptions.push(
		htmlStatus,
		pyStatus,
		hoverProvider,
		completionProvider,
		
		vscode.commands.registerCommand('asok.dev', () => runAsokCommand('dev')),
		vscode.commands.registerCommand('asok.migrate', () => runAsokCommand('migrate')),
		vscode.commands.registerCommand('asok.migrateStatus', () => runAsokCommand('migrate --status')),
		vscode.commands.registerCommand('asok.migrateRollback', () => runAsokCommand('migrate --rollback')),
		vscode.commands.registerCommand('asok.seed', () => runAsokCommand('seed')),
		vscode.commands.registerCommand('asok.routes', () => runAsokCommand('routes')),
		vscode.commands.registerCommand('asok.createsuperuser', () => runAsokCommand('createsuperuser')),

		registerMakeCommand('asok.makeModel', 'model', 'Enter model name'),
		registerMakeCommand('asok.makePage', 'page', 'Enter page name'),
		registerMakeCommand('asok.makeComponent', 'component', 'Enter component name'),
		registerMakeCommand('asok.makeMiddleware', 'middleware', 'Enter middleware name'),
		registerMakeCommand('asok.makeMigration', 'migration', 'Enter migration description'),

		vscode.commands.registerCommand('asok.make', async () => {
			const types = [
				{ label: 'model', description: 'Create a new ORM model' },
				{ label: 'page', description: 'Create a new page (route handler)' },
				{ label: 'component', description: 'Create a new reactive component' },
				{ label: 'middleware', description: 'Create a new middleware' },
				{ label: 'migration', description: 'Generate a new database migration' }
			];

			const selectedType = await vscode.window.showQuickPick(types, {
				placeHolder: 'What would you like to create?'
			});

			if (selectedType) {
				const name = await vscode.window.showInputBox({
					prompt: `Enter the name for your ${selectedType.label}`,
					placeHolder: 'e.g. BlogPost'
				});
				if (name) {
					runAsokCommand(`make ${selectedType.label} ${name}`);
				}
			}
		})
	);
}

export function deactivate() {
	if (terminal) {
		terminal.dispose();
	}
}
