var usage = 
  "Usage:  node jhuw.js <section>\n" +
  "where <section> is, for example, '81', and is used to read in class\n" +
  "data from a file 81.json.\n";

var section = '';
process.argv.forEach(function(val, index, array) {
  //console.log(index + ': ' + val);
  if (index > 1) {
    if (val == '-?' || val == '-h') {
      console.log(usage);
      process.exit(0);
    }
    if (section != '') {
      console.log("Extra argument encountered.\n" + usage);
      process.exit(1);
    }
    section = val;
  }
});

var fs = require('fs');
var class_data_file = __dirname + '/' + section + '.json';
console.log("class_data_file = " + class_data_file);
try {
  var class_data_contents = fs.readFileSync(class_data_file, {encoding: 'utf8'});
  var class_data = JSON.parse(class_data_contents);
}
catch(err) {
  console.log("Problem reading the class data:\n" + err.stack);
  process.exit(1);
}
//console.log("class_data: " + class_data);


// Munge the class data to build accessor data structures
var num_students = class_data.students.length;
var num_groups = class_data.groups.length;
var groups_with_three_students = 0;
var groups_with_three_reviewers = [0, 0, 0];

var students = {
    usernames: [],
    list: [],
};
for (var sn = 0; sn < num_students; ++sn) {
    var sd = class_data.students[sn];
    var username = sd[0];
    var group_name = sd[1];
    students.usernames.push(username);
    var student = {
        username: username,
        num: sn,
        group_name: group_name,
        reviews: [],
    };
    students[username] = student;
    students.list.push(student);
}

var groups = {
    names: [],
    list: [],
};
for (var gn = 0; gn < num_groups; ++gn) {
    var gd = class_data.groups[gn];
    var name = gd[0];
    var article = gd[1];
    groups.names.push(name);
    var group = {
        name: name,
        num: gn,
        article: article,
        students: [],
        num_reviewers: [ 0, 0, 0 ]
    };
    groups[name] = group;
    groups.list.push(group);
}

for (sn = 0; sn < num_students; ++sn) {
    var sd = class_data.students[sn];
    var username = sd[0];
    var group_name = sd[1];
    var student = students[username];
    //console.info("group_name = " + group_name);
    var group = groups[group_name];
    student.group = group;
    group.students.push(student);
    if (group.students.length == 3) groups_with_three_students++;
    
    // class data might have already-specified reviews
    for (sdn = 2; sdn < sd.length; ++sdn) {
      var review_n = sdn - 2;
      var review_group_name = sd[sdn];
      var review_group = groups[review_group_name];
      student.reviews.push(review_group);
      review_group.num_reviewers[review_n]++;
    }
}

console.info("groups_with_three_students = " + groups_with_three_students);

var util = require('util');
//console.log(util.inspect(students, {showHidden: false, depth: null}));
//console.log(util.inspect(groups, {showHidden: false, depth: null}));

//console.log("students:\n", students);
//console.log("groups:\n" + groups);




var depth = 0;
assign_student_review(0, 0);



// This tries one review for this student, and then recurses to try the next student
// and/or next review.  It returns true if we are all, completely done (all students
// have been assigned three reviews) or false if it couldn't find a solution.
function done_or_recurse(sn, rn) {
  var result;
  depth++;
  //console.log("done_or_recurse(" + sn + ", " + rn + "), depth: " + depth);
  
  // Are we done?
  var last_student = (sn == num_students - 1);
  if (last_student && rn == 2) return true;

  // Try to recurse
  var next_sn = last_student ? 0 : sn+1;
  var next_rn = last_student ? rn+1 : rn;
  
  result = assign_student_review(next_sn, next_rn);
  depth--;
  return result;
}

function assign_student_review(sn, rn) {
    debugger;
    var result;
    depth++;
    //console.log("assign_student_review(" + sn + ", " + rn + "), depth: " + depth);
    
    var student = students.list[sn];
    var group = student.group;

    // Maybe this one is already assigned:
    if (student.reviews[rn]) {
      result = done_or_recurse(sn, rn);
      depth--;
      return result;
    }
    
    // Randomize a list of articles to try
    var groups_to_try = random_list(num_groups);
    for (var try_num = 0; try_num < num_groups; ++try_num) {
        var review_group_num = groups_to_try[try_num];
        
        // Not allowed to review your own group.
        if (review_group_num == group.num) continue;
        
        // No group can have more than three reviewers
        review_group = groups.list[review_group_num];
        var num_reviewers = review_group.num_reviewers[rn];
        if (num_reviewers > 2) continue;
        
        // Only a limited number can have three reviewers
        if (num_reviewers == 2 && groups_with_three_reviewers[rn] == groups_with_three_students)
            continue;

        // FIXME:  not allowed to review the same group twice
        var okay = true;
        for (var i = 0; i < rn; ++i) {
          if (student.reviews[i] == review_group) {
            okay = false;
            break;
          }
        }
        if (!okay) continue;

        // Cast it in bronze.
        student.reviews[rn] = review_group;
        review_group.num_reviewers[rn]++
        if (review_group.num_reviewers[rn] == 3) groups_with_three_reviewers[rn]++;
        //console.info("review_group.num_reviewers = " + review_group.num_reviewers + ", " +
        //             "groups_with_three_reviewers = " + groups_with_three_reviewers + ", " +
        //             "sn = " + sn);

        if (done_or_recurse(sn, rn)) {
          depth--;
          return true;
        }
        else {
          // Back up
          if (review_group.num_reviewers[rn] == 3) groups_with_three_reviewers[rn]--;
          review_group.num_reviewers[rn]--;
          student.reviews[rn] = null;
        }
    }
    depth--;
    return false;
}

//console.info(groups);
//console.log("students: ", students);

var sprintf=require("sprintf-js").sprintf;
console.info("             Student     Group   Review 1   Review 2   Review 3");
for (sn = 0; sn < num_students; ++sn) {
    var sd = class_data.students[sn];
    var username = sd[0];
    var group_name = sd[1];
    var student = students[username];
    var reviews = student.reviews;
    console.log(sprintf("%20s  %7s  %7s    %7s    %7s", username, group_name, 
      reviews[0].name, reviews[1].name, reviews[2].name));
}

//process.exit(0);

console.info(
    "===Students / articles===\n" +
    "{| class='wikitable'\n" +
    "|-\n" +
    "! Student\n" +
    "! Group\n" +
    "! Main article\n" +
    "! Review 1\n" +
    "! Review 2\n" +
    "! Review 3"
);
for (sn = 0; sn < num_students; ++sn) {
    var student = students.list[sn];
    var username = student.username;
    var group_name = student.group_name;
    console.info(
        "|-\n" +
        "| [[User:" + username + "|" + username + "]]\n" +
        "| [[Wikipedia:USEP/Courses/JHU MolBio Ogg SP14/Group " + group_name + "|" +
            group_name + "]]\n" +
        "| [[" + student.group.article + "]]\n" +
        "| [[" + student.reviews[0].article + "]]\n" +
        "| [[" + student.reviews[1].article + "]]\n" +
        "| [[" + student.reviews[2].article + "]]"
    );
}
console.info("|}\n\n");


function rand(n) {
    return Math.floor(Math.random()*n);
}

function random_list(length) {
    var list = [];
    for (var i = 0; i < length; ++i) {
        list.push(i);
    }
    return shuffle(list);
}

function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}