"use strict";

QUnit.test("read not delimited field", function(assert) {
  var search = {};
  search.__proto__ = search_prototype;
  search.init("field       trailing garbage", "'", ",", "\\");
  assert.equal(
    search.read_undelimited_field(),
    'field');
});

QUnit.test("read delimited field simple", function(assert) {
  var search = {};
  search.__proto__ = search_prototype;
  search.init("`field`       trailing garbage", "`", ",", "\\");
  assert.equal(
    search.read_delimited_field(),
    'field');
});

QUnit.test("read delimited field with escaped delimiters", function(assert) {
  var search = {};
  search.__proto__ = search_prototype;
  search.init("`field with a \\`shitload\\` of trouble`       trailing garbage", "`", ",", "\\");
  assert.equal(
    search.read_delimited_field(),
    "field with a \\`shitload\\` of trouble");

  var value_string_containing_sql_statement = "'hard: INSERT INTO `asd` (`a,a,a,a,a`, `b`) VALUES (\\'1,1,1\\', \\'b-field-value\\');', 'other value'";
  search.init(value_string_containing_sql_statement, "'", ",", "\\");
  assert.equal(
    search.read_delimited_field(),
    "hard: INSERT INTO `asd` (`a,a,a,a,a`, `b`) VALUES (\\'1,1,1\\', \\'b-field-value\\');");
});

QUnit.test("check position after reading undelimited field", function(assert) {
  var search = {};
  search.__proto__ = search_prototype;
  search.init("field       trailing garbage", "'", ",", "\\");
  search.read_undelimited_field();
  assert.equal(
    search.position,
    4,
    "The position should be at the last processed character");
});

QUnit.test("check position after reading delimited field", function(assert) {
  var search = {};
  search.__proto__ = search_prototype;
  search.init("`field`       trailing garbage", "`", ",", "\\");
  search.read_delimited_field();
  assert.equal(
    search.position,
    6,
    "The position should be at the last processed character");
  search.read_field();

});


QUnit.test( "extract_sqlfields_from_string not delimited fields", function( assert ) {
  assert.deepEqual(
    extract_sqlfields_from_string(
      'nobody, knows, the, trouble, Ive, seen',
      '\''),
  ['nobody', 'knows', 'the', 'trouble', 'Ive', 'seen']
  );
});

QUnit.test( "extract_sqlfields_from_string with delimited fields", function( assert ) {
  assert.deepEqual(
    extract_sqlfields_from_string(
      "'nobody', 'knows', 'the', 'trouble', 'I\\'ve', 'seen'",
      '\''),
  ['nobody', 'knows', 'the', 'trouble', 'I\\\'ve', 'seen']
  );
});

QUnit.test( "extract_sqlfields_from_string with some delimited and some undelimited fields", function( assert ) {
  assert.deepEqual(
    extract_sqlfields_from_string(
      "nobody, 'knows', the, 'trouble', 'I\\'ve', 'seen in my day, Johnny!'",
      '\''),
  ['nobody', 'knows', 'the', 'trouble', 'I\\\'ve', 'seen in my day, Johnny!']
  );
});

QUnit.test("split_sqlinsert simple", function( assert ) {
  assert.deepEqual(
    split_sqlinsert(
      "insert into testtable (field1, field2,field3) values (value1,value2, value3);"
      ),
    {
      'table': 'testtable',
      'fields': 'field1, field2,field3',
      'values': 'value1,value2, value3'
    }
  );
});

QUnit.test("split_sqlinsert with line breaks", function( assert ) {
  assert.deepEqual(
    split_sqlinsert(
      "insert into \ntesttable\n(\nfield1,\nfield2,\nfield3)\nvalues\n\n(value1,\n value2,\n value3\n);"),
    {
      'table': 'testtable',
      'fields': '\nfield1,\nfield2,\nfield3',
      'values': 'value1,\n value2,\n value3\n'
    }
  );

  assert.deepEqual(
    split_sqlinsert(
      "INSERT INTO `asd` (`a,a,a,a,a`, `b`, `c`, `sqlstring`) VALUES ('1,1,1','2','3', 'INSERT INTO `asd` (a, `b`, c) VALUES (\\'1\\',\\'2\\', \\'3\\');');"),
    {
      'table': '`asd`',
      'fields': '`a,a,a,a,a`, `b`, `c`, `sqlstring`',
      'values': "'1,1,1','2','3', 'INSERT INTO `asd` (a, `b`, c) VALUES (\\'1\\',\\'2\\', \\'3\\');'"
    }
  );
});