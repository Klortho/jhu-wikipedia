/*
class_data = {
  students: [
    [ "Amanaresi", "81C" ],
    [ "Amontei2", "81E" ],
    [ "CarpeDiem90", "81H" ],
    [ "Cchandu1", "81G" ],
    [ "DHayes14", "81A" ],
    [ "Gkaltam", "81B" ],
    [ "Kneal0627", "81F" ],
    [ "Magladem96", "81E", ],
    [ "Mmehta10", "81B" ],
    [ "Mnemcek", "81F" ],
    [ "PaleoBioJackie", "81G" ],
    [ "Previte01", "81D" ],
    [ "ReeseLanger", "81B" ],
    [ "Richarnj", "81H" ],
    [ "Ssumpf", "81A" ],
    [ "Tatabox8", "81C" ],
    [ "Wpeissner", "81D" ],
  ],
  groups: [
    [ "81A", "Polysomy" ],
    [ "81B", "AB5 toxin" ],
    [ "81C", "Spermatocyte" ],
    [ "81D", "Nondisjunction" ],
    [ "81E", "DNA base flipping" ],
    [ "81F", "Gene cluster" ],
    [ "81G", "Molecular paleontology" ],
    [ "81H", "Viral transformation" ]
  ]
};
*/

class_data = {
  students: [
    [ "Alpha centauri b", "82I" ],
    [ "Androidhu", "82I" ],
    [ "BigA726", "82H" ],
    [ "Catwell99", "82D" ],
    [ "Crandel5425", "82B" ],
    [ "Deacon C", "82C" ],
    [ "Jhayes21", "82A" ],
    [ "Jocelyn Munson", "82D" ],
    [ "Klbarnhill", "82F" ],
    [ "Lisawisa", "82A" ],
    [ "Lxu27", "82H" ],
    [ "Martinhyou", "82E" ],
    [ "Mishasubz", "82B" ],
    [ "Msmrugby", "82G" ],
    [ "Rmiller587", "82E" ],
    [ "SabFernMB", "82F" ],
    [ "Tmckenne", "82G" ],
    [ "Tmo32", "82C" ],
  ],
  groups: [
    [ "82A", "Paraptosis" ],
    [ "82B", "Aminoallyl nucleotide" ],
    [ "82C", "Minigene" ],
    [ "82D", "Protein inhibitor of activated STAT" ],
    [ "82E", "Dicer" ],
    [ "82F", "Capping enzyme" ],
    [ "82G", "Northwestern blot" ],
    [ "82H", "Histone acetylation and deacetylation" ],
    [ "82I", "5S ribosomal RNA" ],
  ]
};


/*
  First, let's munge up the data to build these structures:

  var students = {
    usernames: [ ... list ... ],
    list: [ ... refs to student objects ... ],
    "Amanaresi": {
        username: "Amanaresi",
        num: 0,
        group_name: "81C",
        group: ...ref...
        review1: ...ref to group...,
        review2: ...ref to group...,
        review3: ...ref to group...,
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
        students: [ ...refs...]
        num_reviewers:  0
    },
    ...
  };
*/

var num_students = class_data.students.length;
var num_groups = class_data.groups.length;
var groups_with_three_students = 0;

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
        num_reviewers: 0
    };
    groups[name] = group;
    groups.list.push(group);
}
for (sn = 0; sn < num_students; ++sn) {
    var sd = class_data.students[sn];
    var username = sd[0];
    var group_name = sd[1];
    var student = students[username];
    console.info("group_name = " + group_name);
    var group = groups[group_name];
    student.group = group;
    group.students.push(student);
    if (group.students.length == 3) groups_with_three_students++;
}

console.info("groups_with_three_students = " + groups_with_three_students);
groups_with_three_reviewers = 0;
assign_student_review(0, 0);

// This tries one review for this student, and then recurses.  It returns true
// if we are all done, or false if it couldn't find a solution.
function assign_student_review(sn, rn) {
    var student = students.list[sn];
    var group = student.group;
    // Randomize list of articles to try
    var groups_to_try = random_list(num_groups);
    for (var try_num = 0; try_num < num_groups; ++try_num) {
        var review_group_num = groups_to_try[try_num];
        // Not allowed to review your own group.
        if (review_group_num == group.num) continue;
        review_group = groups.list[review_group_num];
        // No group can have more than three reviewers
        var num_reviewers = review_group.num_reviewers;
        if (num_reviewers > 2) continue;
        // Only a limited number can have three reviewers
        if (num_reviewers == 2 && groups_with_three_reviewers == groups_with_three_students)
            continue;

        // Cast it in bronze.
        student.review1 = review_group;
        review_group.num_reviewers++
        if (review_group.num_reviewers == 3) groups_with_three_reviewers++;
        console.info("review_group.num_reviewers = " + review_group.num_reviewers + ", " +
                     "groups_with_three_reviewers = " + groups_with_three_reviewers);
        // Are we done?
        if (sn == num_students - 1) return true;

        // Try to recurse
        var result = assign_student_review(sn + 1, rn);
        if (result) return true;

        // Back up
        if (review_group.num_reviewers == 3) groups_with_three_reviewers--;
        review_group.num_reviewers--;
        student.review1 = null;
    }
    return false;
}

//console.info(groups);

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
        "| [[" + student.review1.article + "]]\n" +
        "| [[article]]\n" +
        "| [[article]]"
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