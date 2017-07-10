"use strict";

var search_prototype = {
  'init': function(raw_sqlfields, field_delimiter, field_seperator, char_escape) {
    this.raw_sqlfields =  raw_sqlfields;
    this.field_delimiter =  field_delimiter;
    this.field_seperator =  field_seperator;
    this.char_escape =  char_escape;
    this.position =  0;
    this.mode =  0;
    this.char_cur =  '';
    this.char_prev =  '';
  },
  'read_field': function() {
    if(this.char_cur === this.field_delimiter) {
      return this.read_delimited_field();
    } else {
      return this.read_undelimited_field();
    }
  },
  'read_delimited_field': function() {
    this.position++;  //ToDo: Find cleaner way to do this
    var field = '';

    while(this.position < this.raw_sqlfields.length) {
      this.char_cur = this.raw_sqlfields.charAt(this.position);

      // this should handle escape characters pretty well
      if(this.char_cur === this.char_escape) {
        var char_escaped = this.raw_sqlfields.charAt(this.position+1);
        field += char_escaped;
        this.char_prev = char_escaped;
        this.position += 2;
        continue;
      }

      if(this.char_cur === this.field_delimiter) {
        this.position++;
        return field;
      }

      field += this.char_cur;
      this.position++;
    }
  },
  'read_undelimited_field': function() {
    var remaining_string = this.raw_sqlfields.slice(this.position);
    var match = remaining_string.match(/^\w+/);
    if(!match || !match[0]) {
      throw new Error('Expected unescaped sql value / field, but did not get a usable match in string "'+remaining_string+'"!');
    }
    var field = match[0];
    this.position = this.position + match.index + match[0].length -1;
    return field;
  }
};

function onkey_reformat_sqlinsert(elInput) {
	var elOutput = elInput.parentElement.querySelector('.io_out');
	reformat_sqlinsert_from_element_to_element(elInput, elOutput);
}

function reformat_sqlinsert_from_element_to_element(elInput, elOutput) {
  var sqlinsert_unformatted = elInput.value;
  var sqlinsert_formatted = reformat_sqlinsert(sqlinsert_unformatted);
  elOutput.innerHTML = sqlinsert_formatted;
}

function reformat_sqlinsert(sqlinsert) {
	if(!sqlinsert.toUpperCase().startsWith('INSERT INTO ')) {
    return "no result";
  }
  
  var matches = /INSERT\s+INTO\s+(`[a-z0-9_]+`|\w+)\s+\((.*)\)\s+VALUES\s\((.*)\)/i.exec(sqlinsert).slice(1);
  var raw_table = matches[0];
  var raw_fields = matches[1];
  var raw_values = matches[2];
  var fields = extract_sqlfields_from_string(raw_fields, '`');
  
  var values = extract_sqlfields_from_string(raw_values, "'");
  check_fields_and_values(fields, values);
  
  var field_value_pairs = [];
  var num_pairs = fields.length;
  for(var i=0; i<num_pairs; i++) {
    field_value_pairs.push('`'+fields[i]+'`'+'='+'\''+values[i]+'\'');
  }

  return 'INSERT INTO '+raw_table+' SET '+field_value_pairs.join(", ")+';';
  
}

function extract_sqlfields_from_string(raw_sqlfields, field_delimiter) {
  check_raw_sqlfields(raw_sqlfields);
  check_field_delimiter(field_delimiter);

  var MODE_LOOKING_FOR_FIELD = 0;
  var MODE_LOOKING_FOR_FIELD_SEPERATOR = 1;
  var search = {};
  search.__proto__ = search_prototype;
  search.init(raw_sqlfields, field_delimiter, ',', '\\');

  var fields = [];
  var length = raw_sqlfields.length;
  
  for (search.position = 0; search.position < length; search.position++) {
    search.char_cur = raw_sqlfields.charAt(search.position);

    // this should handle escape characters pretty well
    if(search.char_cur === search.char_escape) {
      search.char_prev = raw_sqlfields.charAt(search.position+1);
      search.position++;
      continue;
    }

    if (search.mode === MODE_LOOKING_FOR_FIELD_SEPERATOR) {
      if(search.char_cur === search.field_seperator) {
        search.mode = MODE_LOOKING_FOR_FIELD;
      } //ToDo: Errors for else cases, basically only whitespace is allowed

    } else if (search.mode === MODE_LOOKING_FOR_FIELD) {
    	if(search.char_cur.match(/[^\s\n,]/)) {
      	var field = search.read_field();
      	fields.push(field);
      	search.mode = MODE_LOOKING_FOR_FIELD_SEPERATOR;
      }
      // else {
      //   throw new Error('Expected either an alphanumeric string or an escaped string to be used as SQL field or value! Got unexpected character \''+search.char_cur+'\'');
      // }
      
    } else {
    	throw new Error('Unknown parsing search.mode "'+search.mode+'"!');
    }
    search.char_prev = search.char_cur;
  }
	return fields;
}

function check_fields_and_values(fields, values) {
  if(typeof fields !== 'object' || typeof values !== 'object') {
    throw new Error('Fields and values must be arrays! Got type for fields:"'+typeof fields+'", values:"'+typeof values+'" ');
  }
  if(fields.length != values.length) {
    throw new Error('Error! Not the same number of fields and values!');
  }
}

function check_raw_sqlfields(raw_sqlfields) {
  if (typeof raw_sqlfields !== 'string') {
  throw new Error("Expected argument raw_sqlfields to be of type 'string'! Got type '"+
    raw_sqlfields.type+"' Variable contains: "+raw_sqlfields);
  }
}

function check_field_delimiter(field_delimiter) {
  if (typeof field_delimiter !== 'string' || field_delimiter.length !== 1) {
    throw new Error("Expected argument field_delimiter to be of type 'string' and to be"+
      " exactly one character long! Got type '"+field_delimiter.type+"' Variable contains: "+field_delimiter);
  }
}