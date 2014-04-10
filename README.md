jhu-wikipedia
=============

Script for organizing JHU Wikipedia project.

To run this, initialize a JSON class data file, such as 81.json, which lists the
students' Wikipedia usernames, the groups they belong to, and (optionally) any reviews
that have already been assigned.  The `groups` section of the data file gives the
group name, followed by the article that that group will be working on.

Then run, for example

```
node jhuw.js 81
```

## Implementation

This uses a pretty cool recursive algorithm for assigning reviewers to articles.

First, the class_data is munged up the data to build the following structures.
The `list` elements are used to preserve the original sort order.

```
var students = {
  usernames: [ ... list ... ],
  list: [ ... refs to student objects ... ],
  "Amanaresi": {
      username: "Amanaresi",
      num: 0,
      group_name: "81C",
      group: ...ref to group object...
      reviews: [ ...refs to groups... ]
  },
  ...
}

var groups = {
  names: [ ... list ... ],
  list: [ ... refs to group objects ... ],
  "81A": {
      name: "81A",
      num: 0,
      article: "Polysomy",
      students: [ ...refs to student objects... ]
      num_reviewers:  [ n1, n2, n3 ]
  },
  ...
};
```



