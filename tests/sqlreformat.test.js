"use strict";

QUnit.test( "extract_sqlfields_from_string test", function( assert ) {
  assert.equal(
    extract_sqlfields_from_string(
      'nobody, knows, the, trouble, \'I\\\'ve\', seen',
      '\'')
  ['nobody', 'knows', 'the', 'trouble', 'I\'ve', 'seen']
  );
});