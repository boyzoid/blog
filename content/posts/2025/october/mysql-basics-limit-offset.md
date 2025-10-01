---
{
"title": "MySQL Basics: Turning the Page—Using LIMIT and OFFSET for Pagination",
"date": "2025-10-14T06:00:00",
"image": "2025/mysql-basics-limit-offset/header.jpg",
"tags": ["MySQL", "Database", "SQL"],
"series": "mysql-basics",
"description": "Discover how to tame big tables using LIMIT and OFFSET in MySQL! This post makes pagination easy for newcomers, using friendly library metaphors, step-by-step SQL examples, and practical tips to help you view your data one page at a time."
}
---

Welcome back, library explorers! By now, you’ve learned how to select, filter, and view data from your tables—like peering through your reading room’s card catalog to spot the newest bestsellers, most loyal readers, or anyone who might have "forgotten" to return a book or two. But what happens when your database shelves are overflowing—say, the student roster for your library is so long, you need a coffee break just to scroll halfway down?

That’s where `LIMIT` and `OFFSET` come in, helping you read your data one “page” at a time. This magical trick is called pagination, and it’s the secret sauce behind every Next Page button you’ve ever clicked on a website.

Let’s breathe some life into our `student` table by adding more friends to the roll call. Because it’s more fun to flip through a real crowd of library fans.

## Adding More Sample Data

Here’s some SQL to bulk up your `student` table:

```sql
INSERT INTO student (id, name, email, enrollment_date) VALUES
  (4, 'David Kim', 'david.kim@example.com', '2024-06-11'),
  (5, 'Emily Wu', 'emily.wu@example.com', '2024-06-12'),
  (6, 'Frank Lee', 'frank.lee@example.com', '2024-06-13'),
  (7, 'Grace Park', 'grace.park@example.com', '2024-06-14'),
  (8, 'Helen Ortiz', 'helen.ortiz@example.com', '2024-06-15'),
  (9, 'Ivan Petrov', 'ivan.petrov@example.com', '2024-06-16'),
  (10, 'Janet Singh', 'janet.singh@example.com', '2024-06-17'),
  (11, 'Ken Nakamura', 'ken.nakamura@example.com', '2024-06-18'),
  (12, 'Lina Rossi', 'lina.rossi@example.com', '2024-06-19');
```

Why stop here? Go wild and invent more students! The only limit is your imagination (and maybe your typing speed).

## What Does LIMIT Do?

Think of `LIMIT` as the “maximum books to display” setting. If your library staff only wants to see the first five students in the club, use:

```sql
SELECT * FROM student LIMIT 5;
```

This peeks at just the top five off the stack—no need to haul the whole pile onto the desk.

## What is OFFSET?

`OFFSET` is like saying, “Skip the first stack of books and start with the sixth.” If you set an `OFFSET`, MySQL skips that number of rows before it starts handing you results. Want to see the second set of five?

```sql
SELECT * FROM student LIMIT 5 OFFSET 5;
```

Here, the first 5 entries are passed over like last season’s reading list, and you see the next batch.

## Paging Through Data (Pagination)

Reading a really long roster? Use `LIMIT` and `OFFSET` together to create “pages” of results—perfect for leafing through your database chapter by chapter.

First page (rows 1–5):

```sql
SELECT * FROM student LIMIT 5 OFFSET 0;
```

Second page (rows 6–10):

```sql
SELECT * FROM student LIMIT 5 OFFSET 5;
```

Third page (rows 11–15):

```sql
SELECT * FROM student LIMIT 5 OFFSET 10;
```

Feeling brave? MySQL also lets you say `LIMIT offset, count` as a shortcut. So `SELECT * FROM students LIMIT 5, 5;` is the same as “skip five, then show five.” Either way, you’re flipping to the right chapter.

## Practical Tips and Use Cases

Pagination isn’t just an SQL party trick—it powers real-world browsing everywhere. Every “see more” or “next page” on library catalogs, online shops, and social media feeds use this trick behind the scenes!

For sanity and sensible reading orders, always use `ORDER BY` in your paginated queries. That way, the students don’t show up shuffled like an over-enthusiastic librarian mixed the queue:

```sql
SELECT * FROM student ORDER BY name LIMIT 5 OFFSET 5;
```

Paging works best when you can trust the order is predictable, not chaotically random.

## Common Pitfalls

Watch out—OFFSET numbers start at 0, not 1. If you ask for `OFFSET 1`, you’ll skip the very first row. Be sure not to miss your favorite student by accident!

And don’t forget `ORDER BY`. Without it, the “next page” may not be what you expect—rows could shift between queries, like a swarm of book-loving gremlins reorganizing the shelves overnight.

## Practice Challenges

Ready for your own library quest? Try these brain-teasers:
- Display rows 6–8 only.
- Show just the last 3 students who joined.
- Combine `LIMIT`, `OFFSET`, and `ORDER BY` to display the 3 earliest students in alphabetical order.

## Conclusion

Pagination is your key to handling data sprawl in style—showing only the page of library members (or books or authors) you’re actually interested in. Try out the queries above, play with page sizes, and imagine you’re running your own bestseller list.

What's next on our library adventure? Get ready to learn why primary and foreign keys matter. Spoiler: they’re the secret to not losing track of who borrowed what and how your tables link together! Stay tuned.

Photo by <a href="https://unsplash.com/@benceboros?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">BENCE BOROS</a> on <a href="https://unsplash.com/photos/open-page-notebook-KnVUtC5bl_A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
      