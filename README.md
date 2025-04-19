# AllDayTsBot
A Discord bot with database abstraction, custom module structure and more!

This is the successor of [AllDayBot](https://github.com/AeroBytesNL/AllDayBot). 
I opted to go with Typescript and Bun for code maintainability and performance.
This version also brings a lot of QoL improvements like the database abstraction,
custom module structure, my own neat logging system and more.

## Installation

Requirements:
- MySQL/MariaDB
- Bun (optional)
- Docker (optional)

#### Development/installation
```shell
    npm install
```

```shell
    bun --watch src/index.ts
```

#### Docker
```sh
    docker build -t AllDayBot .
```
```sh
    docker run -d AllDayBot
```

## Abstractions
### Database
Inspired by Laravel, i've created this abstraction to work with the database
with less hassle. 
You can import it with `import QueryBuilder from '@helpers/database';`.
Example usages:
- `await QueryBuilder.select('users').where({ id: 001921 }).first();`
- `await QueryBuilder.select('users').columns([id, xp]).get();`
- `await QueryBuilder.select('users').columns([id, xp]).orderBy('xp', 'DESC').get();`
- `await QueryBuilder.select('users').count().get();`
- `await QueryBuilder.select('users').limit(10).get();`
- `await QueryBuilder.update('leveling').set({ xp: 100 }).where({ id: 001921 }).execute();`
- `await QueryBuilder.insert('users').values({ user_id: 001921, xp: 15 }).execute();`
- `await QueryBuilder.delete('leveling').where({ id: 1 }).execute();`
- `await QueryBuilder.raw('SELECT * FROM users').execute();`

### S3
Docs w.i.p

### Logging
Docs w.i.p

### Env
Docs w.i.p

### New module
Docs w.i.p

### Migrations
Docs w.i.p

### Refresh slash commands
Docs w.i.p

### CanvasBuilder
Docs w.i.p