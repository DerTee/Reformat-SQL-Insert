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
		"field with a \`shitload\` of trouble"); //ToDo: get this test to properly expect exactly what's this string
});

QUnit.test( "extract_sqlfields_from_string not delimited fields", function( assert ) {
  assert.equal(
    extract_sqlfields_from_string(
      'nobody, knows, the, trouble, Ive, seen',
      '\''),
  ['nobody', 'knows', 'the', 'trouble', 'Ive', 'seen']
  );
});

QUnit.test( "extract_sqlfields_from_string with delimited fields", function( assert ) {
  assert.equal(
    extract_sqlfields_from_string(
      "nobody, knows, the, trouble, 'I\\'ve', seen",
      '\''),
  ['nobody', 'knows', 'the', 'trouble', 'I\'ve', 'seen']
  );
});