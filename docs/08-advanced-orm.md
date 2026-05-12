# Advanced ORM Features

Asok's ORM is designed to be powerful yet lightweight. This guide covers advanced field types and query patterns added for professional applications.

## 1. Advanced Field Types

### JSON Field
Store complex data structures (dicts, lists) transparently.
```python
from asok import Model, Field

class Settings(Model):
    config = Field.JSON(default={})

# Usage
s = Settings.create(config={"theme": "dark", "notifications": True})
print(s.config["theme"]) # "dark" (automatically a dict)
```

### Enum Field
Integrate with Python's standard `enum.Enum` for type-safe choices.
```python
import enum
from asok import Model, Field

class Status(enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"

class User(Model):
    status = Field.Enum(Status, default=Status.PENDING)
```

### Decimal Field
Precise math for financial data (money).
```python
from decimal import Decimal
from asok import Model, Field

class Product(Model):
    price = Field.Decimal(precision=2)

p = Product.create(price=Decimal("19.99"))
```

### UUID Field
Automatically generate unique identifiers.
```python
from asok import Model, Field

class Job(Model):
    uid = Field.UUID() # Auto-generates uuid4 on save
```

### Tel / Phone Field
Store validated phone numbers.
```python
from asok import Model, Field

class User(Model):
    phone = Field.Tel(unique=True)
```

### Rich Text (WYSIWYG)
Upgrade standard textareas to a full-featured editor in the admin panel.
```python
from asok import Model, Field

class Post(Model):
    body = Field.Text(wysiwyg=True) # Enables Quill editor in Admin
```

---

## 2. Advanced Querying

### OR Conditions
```python
User.query().where("status", "active").or_where("is_admin", True).get()
```

### Range & NULL Checks
```python
# Between
Product.query().where_between("price", 10, 50).get()

# NULL checks
User.query().where_null("deleted_at").get()
User.query().where_not_null("email_verified_at").get()
```

### Sorting Shorthands
```python
latest_users = User.query().latest().limit(5).get()
oldest_tasks = Task.query().oldest().get()
```

### Database Indexes
Optimize query performance by adding indexes to frequently filtered columns.

```python
from asok import Model, Field

class User(Model):
    email = Field.String(unique=True)      # Automatic UNIQUE index
    username = Field.String(index=True)    # Regular index for fast lookups
    created_at = Field.DateTime(index=True) # Index for sorting/filtering
    status = Field.String(index=True)      # Index for WHERE clauses
```

**When to use indexes:**
- Columns frequently used in `WHERE` clauses
- Columns used for sorting (`ORDER BY`)
- Foreign keys (for JOIN performance)
- Columns used in `GROUP BY`

**Note:** `unique=True` fields automatically get a UNIQUE index, so don't add `index=True` on them.

### Union Queries
Combine results from multiple queries using SQL UNION (removes duplicates).

```python
from asok import Model, Field

class User(Model):
    role = Field.String(index=True)
    active = Field.Boolean()

# Get all admins OR moderators
admins = User.query().where('role', 'admin')
moderators = User.query().where('role', 'moderator')
staff = admins.union(moderators).get()

# With additional filters and ordering
top_staff = (
    User.query().where('role', 'admin')
    .union(User.query().where('role', 'editor'))
    .order_by('name')
    .limit(10)
    .get()
)
```

**SQL Generated:**
```sql
(SELECT * FROM users WHERE role = ?)
UNION
(SELECT * FROM users WHERE role = ?)
ORDER BY name
LIMIT 10
```

### Intersect Queries
Get only results that appear in both queries using SQL INTERSECT.

```python
# Find users who are BOTH active AND premium
active_users = User.query().where('active', 1)
premium_users = User.query().where('premium', 1)
active_premium = active_users.intersect(premium_users).get()

# SQL: (SELECT * FROM users WHERE active = ?)
#      INTERSECT
#      (SELECT * FROM users WHERE premium = ?)
```

### Subqueries
Use a query as a value in `WHERE IN` clauses for powerful filtering.

```python
from asok import Model, Field

class Post(Model):
    title = Field.String()
    user_id = Field.ForeignKey('User')
    published = Field.Boolean()

# Find all users who have at least one published post
user_ids_with_posts = Post.query().where('published', 1).select('user_id')
authors = User.query().where_in('id', user_ids_with_posts).get()

# SQL: SELECT * FROM users
#      WHERE id IN (SELECT user_id FROM posts WHERE published = ?)
```

**Advanced subquery example:**
```python
# Users who have more than 5 published posts
prolific_author_ids = (
    Post.query()
    .where('published', 1)
    .select('user_id')
    .group_by('user_id')
    # Note: HAVING would need to be added for count > 5
)
authors = User.query().where_in('id', prolific_author_ids).get()
```

**Combining techniques:**
```python
# Premium users OR users with published posts
premium = User.query().where('premium', 1)
authors_ids = Post.query().where('published', 1).select('user_id')
authors = User.query().where_in('id', authors_ids)
valued_users = premium.union(authors).order_by('created_at').get()
```

## 3. Native Vector Search (Semantic)

Asok supports storing and searching high-dimensional vectors (embeddings) directly in SQLite using specialized binary storage and custom similarity functions.

### Defining a Vector Field
Specify the dimensions of your embedding (e.g., 1536 for OpenAI, 384 for standard local models).
```python
from asok import Model, Field

class Document(Model):
    content = Field.String()
    embedding = Field.Vector(dimensions=1536)
```

### Proximity Searching
Use `.nearest()` to find rows most similar to a query vector.
```python
query_vec = [0.1, 0.5, ...] # List of floats
docs = Document.query().nearest("embedding", query_vec, metric="cosine", limit=5).get()
```
*Metrics supported: `cosine` (default) and `euclidean`.*

### Admin Integration
You can enable semantic search in the Admin search bar!
1. Add `vector_search_field` to your `Admin` class.
2. Define an `embed_query` method on your model to convert search text into a vector.

```python
from asok import Model, Field

class Product(Model):
    name = Field.String()
    vec = Field.Vector(1536)

    @classmethod
    def embed_query(cls, text):
        # Call OpenAI / Mistral / Local model here
        return [0.1, 0.2, ...] 

    class Admin:
        search_fields = ["name"]
        vector_search_field = "vec"
```

---

## 4. High-Performance Model Methods

### Atomic Increments/Decrements
Safely update counters directly in SQL to avoid race conditions.
```python
post = Post.find(1)
post.increment("views")  # SQL: UPDATE posts SET views = views + 1 ...
```

### Reloading Data
```python
post.refresh() # Reloads attributes from the database
```

### API Error Handling
Perfect for REST controllers:
```python
from asok import Request, ModelError

def get(request: Request):
    try:
        user = User.find_or_fail(request.params["id"])
        return request.api(user.to_dict())
    except ModelError:
        return request.api_error("User not found", status=404)
```

---
[← Previous: ORM Basics](07-orm.md) | [Documentation](README.md) | [Next: Database Migrations →](09-migrations.md)
