function parseBySubject(data) {
  let subjects = []
  let html = ""
  const subjectEnd = `</ul>
  <li role="separator" class=" mdc-list-divider mdc-list-divider--inset"></li>
  </li>
  </li>`
  for (let homework of data) {
    let subject = homework.subject
    if (subjects.indexOf(subject) == -1) {
      if(subjects.length!=0){
        html += subjectEnd
      }
      const subjectId = "hex" + toHex(subject)
      html += `
      <li  class="form mdc-elevation--z5" style="background-color:#ffffff">
      <h3 class="mdc-list-group__subheader" style="font-size:125%;"><span style="background-color:#ffffff">${subject}</span></h3>
      <ul style="padding: 0px" id="${subjectId}">
      `
      subjects.push(subject)
    }
    html+=parseHomework(homework)
  }
  return html
}

function parseHomework(homework) {
  let {
    id,
    subject,
    dueDate,
    isTest,
    text,
    lastEditPerson: editPerson,
    lastEditTime: editTime
  } = homework
  text = text.replace(/ *\([^)]*\) */g, "");
  let dueDate2 = Sugar.Date.create(dueDate * 1000)
  let daysLeft = Sugar.Date.daysUntil(Sugar.Date.create("Today"), Sugar.Date.create(Sugar.Date.format(dueDate2, "{d}/{M}"), "en-GB"))
  let iconColor = ""
  if (Sugar.Date.isToday(dueDate2)) {
    daysLeft = 0
    iconColor = "red"
  } else if (Sugar.Date.isTomorrow(dueDate2)) {
    iconColor = "#ab47bc"
  }
  let icon = ""
  let bgColor = ""
  let extra = ""
  if (isTest) {
    icon = "&#xe900;"
    bgColor = "#bbdefb"
    extra = ", Graded"
  } else {
    icon = "&#xe873;"
  }
  let displayDate
  switch (daysLeft) {
    case 0:
      displayDate = "Due today"
      break;
    case 1:
      displayDate = "Due tomorrow"
      break;
    default:
      displayDate = `${daysLeft} days left`
  }
  if (isTest) {
    displayDate = toTitle(displayDate.replace("Due ", ""))
  }
  return `
  <li class="mdc-list-item hwitem" dueDate="${dueDate}" editTime="${editTime}" editPerson="${editPerson}" isTest = ${isTest} subject="${subject}" daysLeft="${daysLeft}" sqlID="${id}" style="color:${iconColor};background-color:${bgColor}">
  <span class="mdc-list-item__graphic" role="presentation">
    <i class="material-icons" style="color:${iconColor}" aria-hidden="true">${icon}</i>
  </span>
  <span class="mdc-list-item__text" style="white-space: initial;">
    ${text}
    <span class="mdc-list-item__secondary-text">
     ${displayDate} (${Sugar.Date.format(dueDate2,"{d}/{M}")})${extra}
    </span>
  </span>
  </li>
  `
}
toTitle = function(str)
{
return str.substring(0,1).toUpperCase()+str.substring(1,10000)
}
toHex = function(str){
  var hex, i;

  var result = "";
  for (i=0; i<str.length; i++) {
      hex = str.charCodeAt(i).toString(16);
      result += (hex).slice(-4);
  }

  return result
}