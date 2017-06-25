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
  console.log('fields:');
  console.log(fields);
  
  var values = extract_sqlfields_from_string(raw_values, "'");
  console.log('values:');
  console.log(values);
  console.log('---------------------');
  if(fields.length != values.length) { throw "Error! Not the same number of fields and values!"; }
  var field_value_pairs = [];
  var num_pairs = fields.length;
  for(var i=0; i<num_pairs; i++) {
    field_value_pairs.push(fields[i]+'='+values[i]);
  }

  return 'INSERT INTO '+raw_table+' SET '+field_value_pairs.join(", ")+';';
  
}

function extract_sqlfields_from_string(raw_sqlfields, char_optional_field_marker) {
  if (typeof raw_sqlfields !== 'string') {
  	throw new Error("Expected argument raw_sqlfields to be of type 'string'! Got type '"+raw_sqlfields.type+"' Variable contains: "+raw_sqlfields);
  }
  if (typeof char_optional_field_escape !== 'string' || char_optional_field_escape.length !== 1) {
  	throw new Error("Expected argument char_optional_field_escape to be of type 'string' and to be exactly one character long! Got type '"+raw_sqlfields.type+"' Variable contains: "+raw_sqlfields);
  }
  const STATUS_LOOKING_FOR_FIELD = 0;
  const STATUS_LOOKING_FOR_FIELD_SEPERATOR = 1;
  var status = STATUS_LOOKING_FOR_FIELD;
	var fields = [];
  var field_seperator = ',';
  var field_uses_delimiter = false;
  var char_prev = '';
  var char_cur = '';
  var length = raw_sqlfields.length;
  
  for (var i = 0; i < length; i++) {
    char_cur = raw_sqlfields.charAt(i);

    if (status === STATUS_LOOKING_FOR_FIELD_SEPERATOR) {
      if(char_cur === )
    } else if (status === STATUS_LOOKING_FOR_FIELD) {
    	if(char_cur.match(/[^\s\n,]/)) {
      	var field = read_field(raw_sqlfields, i, , field_uses_delimiter);
      	fields.push(field);
      	status = STATUS_LOOKING_FOR_FIELD_SEPERATOR;
      }
    } else {
    	throw new Error('Unknown parsing status "'+status+'"!');
    }
    char_prev = char_cur;
  }
	return fields;
}

function read_field() {
	return '';
}