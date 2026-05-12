# Forms

Asok provides a declarative form system that generates HTML and handles validation automatically.

## Basic usage

```python
# src/pages/contact/page.py
from asok import Request, Form

def render(request: Request):
    form = Form({
        'name':    Form.text('Name', 'required|min:2', placeholder='Your name'),
        'email':   Form.email('Email', 'required|email', placeholder='you@example.com'),
        'message': Form.textarea('Message', 'required|min:10'),
    }, request)

    if form.validate():
        # All fields are valid — process the data
        request.flash('success', 'Sent!')
        request.redirect('/contact')

    return request.html('page.html', form=form)
```

## Form constructor

```python
Form(fields_dict: dict, request: Request = None)
```

`fields_dict` is **required**. `request` is optional — if omitted, the form acts as a template that you bind later. There are four equivalent ways to wire a form to a request:

```python
# 1. Bound at construction (most common in pages)
form = Form({'name': Form.text('Name', 'required')}, request)

# 2. Bind later with .bind(request)
form = Form({'name': Form.text('Name', 'required')})
form.bind(request)
if form.validate(): ...

# 3. Pass the request directly to .validate()
form = Form({'name': Form.text('Name', 'required')})
if form.validate(request): ...

# 4. Share globally and let asok auto-bind per request
# (see "Reusable forms" below)
app.share(my_form=Form({'name': Form.text('Name', 'required')}))
```

Calling `form.validate()` without ever binding a request raises `RuntimeError`.

```html
<!-- src/pages/contact/page.html -->
<form method="POST">
    {{ request.csrf_input() }}

    {{ form.name }}
    {{ form.email }}
    {{ form.message }}

    <button type="submit">Send</button>
</form>
```

`{{ form.name }}` generates the full block: label + input + error message.

## Generated HTML

```html
<!-- Without error -->
<div class="form-group">
  <label for="name">Name</label>
  <input type="text" id="name" name="name" value="" placeholder="Your name">
</div>

<!-- With error -->
<div class="form-group">
  <label for="name">Name</label>
  <input type="text" id="name" name="name" value="J" class="input-error" placeholder="Your name">
  <div class="form-error">Minimum 2 characters.</div>
</div>
```

## Render parts separately

For more control over the HTML:

```html
{{ form.name.label }}   → <label for="name">Name</label>
{{ form.name.input }}   → <input type="text" ...>
{{ form.name.error }}   → <div class="form-error">...</div> (or empty)
```

## Custom classes (Tailwind, etc.)

Pass attributes when rendering to override defaults:

```html
<!-- Full field with custom input class -->
{{ form.name(class_="mb-6") }}

<!-- Individual parts -->
{{ form.name.label(class_="text-sm font-bold text-gray-700") }}
{{ form.name.input(class_="border rounded-lg px-4 py-2 w-full") }}
{{ form.name.error(class_="text-red-500 text-xs mt-1") }}
```

Since `class` is a Python reserved word, use `class_` — the trailing underscore is stripped automatically. This works for any attribute: `for_` becomes `for`, etc.

## Field types

```python
Form.text('Label', 'rules', placeholder='...')
Form.email('Label', 'rules')
Form.password('Label', 'rules')
Form.textarea('Label', 'rules')
Form.number('Label', 'rules')
Form.file('Label', 'rules')
Form.hidden('rules')
Form.checkbox('Label', 'rules')
Form.select('Label', [('val', 'Display'), ...], 'rules')
Form.dropdown('Label', items, searchable=True)
Form.radio('Label', [('val', 'Display'), ...], 'rules')
Form.title('Section Name')   # Renders <h3>, no input

# New in v0.1.4 - Basic UI Components
Form.image('Label', 'rules', preview=True, max_width=200, max_height=200)
Form.tags('Label', 'rules', choices=[('val', 'Label'), ...], searchable=True)
Form.daterange('Label', 'rules', start_label='From', end_label='To')
Form.toggle('Label', 'rules')
Form.otp('Label', 'rules', length=6)
Form.month('Label', 'rules')
Form.rating('Label', 'rules', max_stars=5)
Form.timerange('Label', 'rules', start_label='From', end_label='To')

# New in v0.1.4 - Advanced Components
Form.files('Label', 'rules', max_files=10, preview=True)
Form.autocomplete('Label', 'rules', items=[...], min_chars=1)
Form.cascading('Label', 'rules', choices={...})
Form.phone('Label', 'rules', default_country='US')
Form.wysiwyg('Label', 'rules', height=300)
Form.dropzone('Label', 'rules', max_files=10)
Form.signature('Label', 'rules', width=400, height=200)
Form.transfer('Label', 'rules', items=[...])
Form.treeselect('Label', 'rules', items=[...])

```

### Image preview

Upload an image file with live preview in the browser.

```python
form = Form({
    'avatar': Form.image(
        'Profile Picture',
        rules='ext:jpg,png,gif|size:5M',
        preview=True,        # Show preview (default True)
        max_width=300,       # Preview max width in pixels
        max_height=300       # Preview max height in pixels
    ),
}, request)
```

When a user selects an image, it's instantly displayed below the file input. Perfect for profile pictures, thumbnails, and any image upload scenario.

### Tags / Multi-select

Multi-select field with a tag-based UI for choosing multiple options.

```python
form = Form({
    'skills': Form.tags(
        'Technical Skills',
        choices=[
            ('python', 'Python'),
            ('js', 'JavaScript'),
            ('sql', 'SQL'),
            ('docker', 'Docker'),
        ],
        searchable=True,      # Enable search filtering (default True)
        allow_custom=False,   # Allow custom tags (default False)
        rules='required'
    ),
}, request)
```

Selected items appear as removable pills/tags. The field stores values as a JSON array (`["python", "js"]`). Use `json.loads()` to parse in your handler:

```python
import json
if form.validate():
    skills = json.loads(form.data['skills'])  # ['python', 'js']
```

### Date range picker

Select a start and end date for periods, bookings, or date ranges.

```python
form = Form({
    'booking': Form.daterange(
        'Availability Period',
        start_label='Check-in',   # Custom label for start date
        end_label='Check-out',    # Custom label for end date
        rules='required|future'   # Prevent past dates
    ),
}, request)
```

**Features:**
- **Auto-Validation**: The framework automatically ensures the end date is not before the start date.
- **Future Rule**: Use the `future` rule to prevent selecting dates in the past.
- **Live Constraints**: The UI automatically restricts the "To" date selection based on the "From" date value.

The field stores the range as JSON: `{"start": "2024-03-15", "end": "2024-03-20"}`. Parse it in your handler:

```python
import json
if form.validate():
    booking = json.loads(form.data['booking'])
    start_date = booking['start']  # "2024-03-15"
    end_date = booking['end']      # "2024-03-20"
```

## Advanced Form Fields (v0.1.4+)

Asok includes 15 additional advanced form components for modern UIs.

### Toggle Switch

Modern alternative to checkboxes with a sliding switch UI.

```python
form = Form({
    'notifications': Form.toggle('Enable Notifications', rules='required'),
}, request)
```

Returns `"1"` when checked, `"0"` when unchecked. Perfect for settings and preferences.

### OTP Input

Separate boxes for each digit of a verification code.

```python
form = Form({
    'code': Form.otp('Verification Code', rules='required', length=6),
}, request)
```

Auto-focuses to the next box as the user types. Returns the complete code as a string (e.g., `"123456"`).

### Month/Year Picker

Select month and year (e.g., for credit card expiration dates).

```python
form = Form({
    'expiry': Form.month('Card Expiry', rules='required'),
}, request)
```

Returns format `"YYYY-MM"` (e.g., `"2025-12"`).

### Star Rating

Interactive star rating input.

```python
form = Form({
    'rating': Form.rating('Rate this product', max_stars=5, rules='required'),
}, request)
```

Returns the selected rating as an integer (1-5).

### Time Range Picker

Select a time range with start and end times.

```python
form = Form({
    'hours': Form.timerange(
        'Business Hours',
        start_label='Opens',
        end_label='Closes',
        rules='required'
    ),
}, request)
```

Returns JSON: `{"start": "09:00", "end": "17:00"}`.

### Multi-file Upload

Upload multiple files with image previews.

```python
form = Form({
    'photos': Form.files(
        'Product Photos',
        max_files=5,
        preview=True,
        rules='ext:jpg,png'
    ),
}, request)
```

Returns a list of uploaded files. Access via `request.files['photos']`.

### Autocomplete

Input with suggestions as you type.

```python
form = Form({
    'city': Form.autocomplete(
        'City',
        items=['Paris', 'London', 'New York', 'Tokyo'],
        min_chars=2,
        rules='required'
    ),
}, request)
```

Shows filtered suggestions after typing `min_chars` characters.

### Cascading Select

Dependent dropdowns where the second select updates based on the first.

```python
form = Form({
    'location': Form.cascading('Location', choices={
        'France': ['Paris', 'Lyon', 'Marseille'],
        'UK': ['London', 'Manchester', 'Edinburgh'],
        'USA': ['New York', 'Los Angeles', 'Chicago']
    }, rules='required'),
}, request)
```

Returns `"Country > City"` format (e.g., `"France > Paris"`).

### International Phone Input

Phone number input with a premium country code selector featuring emoji flags and automatic dial codes.

```python
form = Form({
    'phone': Form.phone(
        'Mobile Number',
        default_country='FR',  # ISO code (default: 'US')
        rules='required'
    ),
}, request)
```

**Features:**
- **Exhaustive Support**: Includes all 249 countries and territories from the `asok.Countries` database.
- **Emoji Flags**: High-quality visual indicators for easy recognition.
- **Auto-Formatting**: Combines the selected dial code with the user's input.
- **Validation**: Ensures the result is a valid international phone number (e.g., `"+33612345678"`).

### WYSIWYG Editor

Rich text editor with formatting toolbar.

```python
form = Form({
    'content': Form.wysiwyg(
        'Article Content',
        height=400,
        rules='required'
    ),
}, request)
```

Returns HTML content with formatting (bold, italic, lists, etc.).

### Drag & Drop File Upload

Drag and drop zone for file uploads.

```python
form = Form({
    'documents': Form.dropzone(
        'Drop files here',
        max_files=10,
        rules='ext:pdf,doc,docx'
    ),
}, request)
```

Users can drag files or click to browse. Returns list of uploaded files.

### Signature Pad

Canvas-based signature capture with mouse drawing.

```python
form = Form({
    'signature': Form.signature(
        'Sign Here',
        width=500,
        height=150,
        rules='required|base64'
    ),
}, request)
```

**Features:**
- Draw signatures with mouse or touch
- Clear button to restart
- Automatic base64 PNG conversion
- CSP-compliant (uses Asok directives)

**Displaying signatures:**

In templates, use the `decode_base64` filter to display saved signatures:

```html
<!-- Simple display -->
{{ user.signature | decode_base64 }}

<!-- With Tailwind CSS -->
{{ user.signature | decode_base64(class_="w-64 border rounded") }}
```

**In Model:**

```python
class User(Model):
    signature = Field.String(
        max_length=100000,  # Base64 can be large
        nullable=True,
        form_type="signature"  # Auto-uses signature canvas
    )
```

### Transfer List

Dual listbox for moving items between available and selected lists.

```python
form = Form({
    'permissions': Form.transfer('Permissions', items=[
        {'id': 1, 'name': 'Read'},
        {'id': 2, 'name': 'Write'},
        {'id': 3, 'name': 'Delete'}
    ], rules='required'),
}, request)
```

Returns JSON array of selected IDs: `[1, 3]`.

### Tree Select

Hierarchical selection from a tree structure.

```python
form = Form({
    'category': Form.treeselect('Category', items=[
        {
            'id': 1,
            'name': 'Electronics',
            'children': [
                {'id': 2, 'name': 'Phones'},
                {'id': 3, 'name': 'Laptops'}
            ]
        }
    ], rules='required'),
}, request)
```

Returns the selected item's ID.



### Dropdown example

A premium, searchable dropdown that handles lists of strings, dicts, or Models.

```python
form = Form({
    'fruit': Form.dropdown('Select a fruit', ['Apple', 'Banana', 'Mango'], searchable=True),
}, request)
```

### Select example

```python
form = Form({
    'country': Form.select('Country', [
        ('fr', 'France'),
        ('us', 'United States'),
        ('uk', 'United Kingdom'),
    ], 'required'),
}, request)
```

### Radio example

```python
form = Form({
    'plan': Form.radio('Plan', [
        ('free', 'Free'),
        ('pro', 'Pro — $9/mo'),
    ], 'required'),
}, request)
```

### Checkbox example

```python
form = Form({
    'agree': Form.checkbox('I agree to the terms', 'required'),
}, request)
```

### Title (section divider)

```python
form = Form({
    'section1': Form.title('Personal Information'),
    'name':     Form.text('Name', 'required'),
    'section2': Form.title('Account'),
    'email':    Form.email('Email', 'required|email'),
}, request)
```

## Generate a form from a Model

For CRUD pages, you usually don't want to repeat the field schema that's already in your Model. `Form.from_model()` builds the form schema by inspecting the Model's `Field` definitions:

```python
from asok import Form
from models.contact import Contact

def render(request):
    form = Form.from_model(Contact, request)
    if form.validate():
        Contact.create(**form.data)
        request.flash('success', 'Saved!')
        request.redirect('/contacts')
    return request.html('page.html', form=form)
```

For an edit page:

```python
def render(request: Request):
    contact = Contact.find(id=request.params.get('id'))
    form = Form.from_model(Contact, request).fill(contact)
    if form.validate():
        contact.update(**form.data)
        request.flash('success', 'Updated!')
        request.redirect(f'/contacts/{contact.id}')
    return request.html('page.html', form=form)
```

### Signature

```python
Form.from_model(
    model,
    request: Request = None,
    include_fields: list = None,
    exclude_fields: list = None,
)
```

- `include_fields=['name', 'email']` — only generate these fields
- `exclude_fields=['internal_notes']` — generate all fields except these

### Auto-mapping rules

| Model field | Form field |
|---|---|
| `Field.String(max_length=N)` | `text` input with `maxlength=N` and `max:N` rule |
| `Field.Text()` | `textarea` |
| `Field.Email()` | `email` input with `email` rule |
| `Field.Integer()` | `number` input |
| `Field.Float(precision=N)` | `number` input with `step="0.01"` (per precision) |
| `Field.Boolean()` | `checkbox` |
| `Field.Date()` | `date` input (when name matches conventions) |
| `Field.ForeignKey(Other)` | `select` with all rows from the related model |
| `Field.File()` | `file` input |
| `Field.Password()` | `password` input (rules cleared so edits don't force re-entry) |

Validation rules are derived automatically: `nullable=False` adds `required`, `Email` adds `email`, `max_length` adds `max:N`.

### Custom labels, rules and messages

Fields can define **custom labels**, **validation rules**, and **error messages** that are automatically used when generating forms:

```python
# src/models/contact.py
class Contact(Model):
    __tablename__ = "contacts"

    name = Field.String(
        max_length=100,
        nullable=False,
        label="Full Name",              # Custom label
        rules="min:4|alpha_spaces",      # Custom validation rules
        messages={
            "required": "Please enter your full name",
            "min": "Name must be at least 4 characters",
            "max": "Name cannot exceed 100 characters",
            "alpha_spaces": "Only letters and spaces allowed"
        }
    )

    email = Field.Email(
        max_length=100,
        nullable=False,
        label="Email Address",
        messages={
            "required": "Email is required",
            "email": "Please provide a valid email"
        }
    )

    message = Field.Text(
        nullable=False,
        label="Your Message",
        rules="min:10",
        messages={
            "required": "Message is required",
            "min": "Message must be at least 10 characters"
        }
    )
```

When you generate a form from this model:

```python
form = Form.from_model(Contact, request)
```

The form automatically:
- Uses **custom labels** ("Full Name" instead of "Name")
- Combines **auto-generated + custom rules** (`required|max:100|min:4|alpha_spaces`)
- Displays **custom error messages** when validation fails

**Without custom label:**
```python
name = Field.String(max_length=100)  # Label will be "Name" (auto-generated from field name)
```

**With custom label:**
```python
name = Field.String(max_length=100, label="Full Name")  # Label will be "Full Name"
```

See [ORM Basics](07-orm.md#labels-rules-and-custom-error-messages) for more details on defining these at the model level.

### Custom Form Types (v0.1.4+)

Use the `form_type` parameter to override the default form field type:

```python
class Product(Model):
    __tablename__ = "products"

    # Boolean as toggle switch instead of checkbox
    featured = Field.Boolean(
        default=False,
        label="Featured Product",
        form_type="toggle"  # Uses Form.toggle() instead of Form.checkbox()
    )

    # Integer as star rating instead of number input
    rating = Field.Integer(
        default=0,
        label="Customer Rating",
        form_type="rating",  # Uses Form.rating() with stars
        rules="between:1,5"
    )

    # String as signature canvas
    signature = Field.String(
        max_length=100000,
        nullable=True,
        label="Signature",
        form_type="signature",  # Uses Form.signature() canvas
        rules="base64"
    )
```

When you generate a form with `Form.from_model(Product, request)`, these fields automatically use their custom form types instead of the default mappings.

**Available form_type values:**
- `"toggle"` - Toggle switch (for Boolean fields)
- `"rating"` - Star rating (for Integer fields)
- `"signature"` - Signature canvas (for String fields)
- `"otp"` - OTP input boxes (for String fields)
- `"month"` - Month/year picker (for String fields)
- `"wysiwyg"` - Rich text editor (for Text fields)
- `"phone"` - International phone input (for String fields)
- And all other form field types from the Advanced Form Fields section

**Displaying base64 fields in templates:**

For fields like signatures that store base64 data, use the `decode_base64` filter:

```html
{{ product.signature | decode_base64(class_="w-64 border") }}
```

### Auto-excluded fields

These are skipped automatically (you don't need to put them in `exclude_fields`):

- `id`
- `Field.CreatedAt()` / `Field.UpdatedAt()` (timestamps)
- `Field.SoftDelete()`
- `Field.Slug(populate_from=...)` when auto-populated

### Customizing further

`Form.from_model()` returns a regular `Form`, so you can mutate the schema after creation if needed:

```python
form = Form.from_model(Contact, request, exclude_fields=['internal_notes'])
form._fields['email'].attrs['autofocus'] = True
```

## Translating labels (i18n)

Use `request.__()` to translate form labels:

```python
def render(request: Request):
    __ = request.__

    form = Form({
        'name':    Form.text(__('form_name'), 'required|min:2'),
        'email':   Form.email(__('form_email'), 'required|email'),
        'message': Form.textarea(__('form_message'), 'required|min:10'),
    }, request)
```

```json
// src/locales/en.json
{ "form_name": "Your name", "form_email": "Your email address", "form_message": "Your message" }

// src/locales/fr.json
{ "form_name": "Votre nom", "form_email": "Votre adresse mail", "form_message": "Votre message" }
```

Validation error messages are also translated automatically — see [Validation](14-validation.md).

## Custom error messages

```python
Form.text('Name', 'required|min:2', messages={
    'required': 'Please enter your name.',
    'min': 'Name is too short.',
})
```

## Pre-filling for edit forms

Use `form.fill(obj_or_dict)` to populate fields from an existing record. It only applies on non-POST requests, so submitted values are preserved when re-rendering after a failed validation.

```python
def render(request):
    user = User.find(id=request.params['id'])

    form = Form({
        'name':  Form.text('Name', 'required|min:2'),
        'email': Form.email('Email', 'required|email'),
    }, request).fill(user)

    if form.validate():
        user.update(**form.data)
        request.flash('success', 'Updated!')
        request.redirect(f'/users/{user.id}')

    return request.html('page.html', form=form)
```

`fill()` accepts a model instance or a dict, and returns `self` for chaining.

## Accessing values after POST

The cleanest way is `form.data` — a dict of all field values, ready to pass to a model:

```python
if form.validate():
    User.create(**form.data)
```

Field-by-field access works too:

```python
if form.validate():
    email = form.email.value     # via the form object
    name = request.form['name']  # via the raw POST dict
```

## Checking errors

```python
form.errors  # {'name': 'Minimum 2 characters.', 'email': 'Invalid email address.'}
```

## Reset form

`form.reset()` clears all field values and errors. Returns `self` for chaining.

```python
if form.validate():
    request.flash('success', 'Sent!')
    form.reset()
```

After `reset()`, the rendered form is empty, as if the page was loaded for the first time.

## Reusable forms (newsletter, search, etc.)

To embed the same form on multiple pages — e.g. a newsletter form in the footer of every page — declare it once with `app.share()` and add a dedicated page to handle the POST.

### 1. Declare the form globally

```python
# wsgi.py
from asok import App, Form

app = App()

app.share(
    newsletter_form=Form({
        'email': Form.email('Email', 'required|email', placeholder='you@example.com'),
    }),
)
```

`Form({...})` (without a request) creates a **template** — Asok auto-bind a fresh instance per request. Now `newsletter_form` is available in every template.

### 2. Dedicated page that handles submission

```python
# src/pages/newsletter/page.py
from asok import Request
from models.subscriber import Subscriber

def render(request: Request):
    # Using shared_form instead of shared for full IDE autocompletion
    form = request.shared_form('newsletter_form')

    if form.validate():
        Subscriber.first_or_create(**form.data)
        request.flash('success', 'Subscribed!')
        form.reset()
    return request.html('page.html')
```

```html
<!-- src/pages/newsletter/page.html -->
{% extends "html/base.html" %}
{% block main %}
  {% include "html/newsletter_form.html" %}
{% endblock %}
```

### 3. The reusable partial

```html
<!-- src/partials/html/newsletter_form.html -->
<form method="POST" action="/newsletter" data-block="newsletter-block">
  {{ request.csrf_input() }}
  <div id="newsletter-block">
    {% for msg in get_flashed_messages() %}
      <div class="flash {{ msg.category }}">{{ msg.message }}</div>
    {% endfor %}
    {{ newsletter_form.email }}
    <button type="submit">Subscribe</button>
  </div>
</form>
```

### 4. Drop it anywhere

```html
<!-- src/partials/html/footer.html -->
<footer>
  <h3>Stay updated</h3>
  {% include "html/newsletter_form.html" %}
</footer>
```

### IDE Autocompletion for shared variables

When using `request.shared(name)`, your IDE usually doesn't know the type of the returned object. Asok provides two ways to get full IntelliSense:

#### 1. Specialized helper (Preferred for Forms)

Use `request.shared_form(name)` instead of the generic `shared()`. It is explicitly typed to return a `Form` instance.

```python
form = request.shared_form('contact_form')
# Now, form.validate(), form.reset(), etc. are suggested by your IDE
```

#### 2. Manual type hint

For other types of objects, pass the expected class as the second argument to `request.shared()`:

```python
from models.user import User

user = request.shared('current_user', User)
# IDE now knows 'user' is an instance of User
```

## Partial update (no full page reload)

Add `data-block` on the `<form>` to submit via `fetch` and swap only the block content in the DOM:

```html
<!-- page.html -->
{% extends "html/base.html" %}
{% block main %}

{% for msg in get_flashed_messages() %}
    <div class="flash {{ msg.category }}">{{ msg.message }}</div>
{% endfor %}

<form method="POST" data-block="main">
    {{ request.csrf_input() }}
    {{ form.name }}
    {{ form.email }}
    {{ form.message }}
    <button type="submit">Send</button>
</form>

{% endblock %}
```

```python
# page.py
def render(request: Request):
    form = Form({
        'name':    Form.text('Name', 'required|min:2'),
        'email':   Form.email('Email', 'required|email'),
        'message': Form.textarea('Message', 'required|min:10'),
    }, request)

    if form.validate():
        request.flash('success', 'Sent!')
        form.reset()

    return request.html('page.html', form=form)
```

---
[← Previous: Native Vector Search](10-vector-search.md) | [Documentation](README.md) | [Next: Advanced Forms Features →](12-advanced-forms.md)
