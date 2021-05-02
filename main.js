const weeks = ['日', '月', '火', '水', '木', '金', '土'];
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
const config = {
  show: 1,
};

//画面を開いたときに1度だけ実行する
window.onload = function () {
  var eventCollection = null;
  firebase.database().ref('events').once('value', (snapshot) => {
    // console.log(snapshot.val());
    events = snapshot.val();

    if (events != null) {
      eventCollection = (Object.values(events));
      // console.log(eventCollection);
    }
    showCalendar(year, month, eventCollection);
  });
  document.querySelector('#prev').addEventListener('click', moveCalendar);
  document.querySelector('#next').addEventListener('click', moveCalendar);
};



function showCalendar(year, month, events) {
  for (i = 0; i < config.show; i++) {
    createCalendar(year, month, events);

    month++;
    if (month > 12) {
      year++;
      month = 1;
    }
  }
};

function createCalendar(year, month, events) {
  const startDate = new Date(year, month - 1, 1); // 月の最初の日を取得
  const endDate = new Date(year, month, 0); // 月の最後の日を取得
  const endDayCount = endDate.getDate(); // 月の末日
  const lastMonthEndDate = new Date(year, month - 1, 0); // 前月の最後の日の情報
  const lastMonthendDayCount = lastMonthEndDate.getDate(); // 前月の末日
  const startDay = startDate.getDay(); // 月の最初の日の曜日を取得
  let dayCount = 1; // 日にちのカウント
  let calendarHtml = ''; // HTMLを組み立てる変数

  // show 'year / month'
  let h1Node = document.createElement('h1');
  let titleNode = document.createTextNode(year + '/' + month);
  h1Node.appendChild(titleNode);

  let tableNode = document.createElement('table');
  let tbodyNode = document.createElement('tbody');
  // 曜日の行を作成
  var weekNode = "";
  var trNode = document.createElement('tr');
  for (let i = 0; i < weeks.length; i++) {
    let weekNode = document.createElement('td');
    let dayOfTheWeek = document.createTextNode(weeks[i]);
    weekNode.appendChild(dayOfTheWeek);
    trNode.appendChild(weekNode);
    tbodyNode.appendChild(trNode);
  }

  // 各週
  for (let w = 0; w < 6; w++) {
    let trNode = document.createElement('tr');
    for (let d = 0; d < 7; d++) {

      if (w == 0 && d < startDay) {
        // 1行目で1日の曜日の前
        let num = lastMonthendDayCount - startDay + d + 1;
        var tdNode = document.createElement('td');
        tdNode.className = 'is-disabled';
        let previousMonthDate = document.createTextNode(num);
        tdNode.appendChild(previousMonthDate);
        trNode.appendChild(tdNode);
      } else if (dayCount > endDayCount) {
        // 末尾の日数を超えた
        var tdNode = document.createElement('td');
        let num = dayCount - endDayCount;
        tdNode.className = 'is-disabled';
        let nextMonthDate = document.createTextNode(num);
        tdNode.appendChild(nextMonthDate);
        trNode.appendChild(tdNode);
        dayCount++;
      } else {
        const targetData = `${year}${("00" + month).slice(-2)}${("00" + dayCount).slice(-2)}`;

        var filterEvent = null;
        if (events != null) {
          filterEvent = events.filter(function (event) {
            return event.date === targetData;
          });
        }
        // console.log(filterEvent[0] != null);
        var tdNode = document.createElement('td');
        // イベントリスナー追加
        tdNode.addEventListener("click", close, false);
        var divNode = document.createElement('div');
        divNode.className = 'apple';
        // console.log(filterEvent);
        if (filterEvent != null && filterEvent[0] != null) {
          divNode.style.display = 'block';
        } else {
          divNode.style.display = 'none';
        }
        divNode.id = targetData;
        let imageNode = document.createElement('img');
        imageNode.src = 'photo02.png';
        imageNode.width = 33;
        imageNode.height = 33;
        divNode.appendChild(imageNode);
        var formNode = document.createElement('div');
        formNode.id = 'form-text-' + targetData;
        if (filterEvent != null && filterEvent[0] != null) {
          formNode.textContent = filterEvent[0].contents;
        }
        let dateNode = document.createTextNode(dayCount);
        tdNode.appendChild(dateNode);
        tdNode.appendChild(divNode);
        tdNode.appendChild(formNode);
        trNode.appendChild(tdNode);
        dayCount++;
      }
    }
    trNode.appendChild(tdNode);
    tbodyNode.appendChild(trNode);
    tableNode.appendChild(tbodyNode);
  }

  //calendar
  let calendar = document.getElementById('calendar');
  let sectionNode = document.createElement('section');

  sectionNode.appendChild(h1Node);
  sectionNode.appendChild(tableNode);
  calendar.appendChild(sectionNode);

}

function moveCalendar(e) {
  var eventCollection = null;
  firebase.database().ref('events').on('value', (snapshot) => {
    console.log(snapshot.val());
    events = snapshot.val();

    if (events != null) {
      eventCollection = (Object.values(events));
      // console.log(eventCollection);
    }
  });

  document.querySelector('#calendar').innerHTML = '';

  if (e.target.id === 'prev') {
    month--;

    if (month < 1) {
      year--;
      month = 12;
    }
  }

  if (e.target.id === 'next') {
    month++;

    if (month > 12) {
      year++;
      month = 1;
    }
  }

  showCalendar(year, month, eventCollection);
}

firebase.database().ref('events').on('value', (snapshot) => {
  console.log(snapshot.val());
  document.querySelector('#prev').addEventListener('click', moveCalendar);
  document.querySelector('#next').addEventListener('click', moveCalendar);
  events = snapshot.val();
  var eventCollection = null;
  if (events != null) {
    eventCollection = (Object.values(events));
    // console.log(eventCollection);
  }
  // showCalendar(year, month, eventCollection);
});


document.getElementById("form-button").onclick = function () {
  var date = new Date($('#input-date').val());
  format_str = 'YYYYMMDD';
  format_str = format_str.replace(/YYYY/g, date.getFullYear());
  var month = date.getMonth() + 1;
  var m0 = ('0' + month).slice(-2);
  format_str = format_str.replace(/MM/g, m0);
  var d0 = ('0' + date.getDate()).slice(-2);
  format_str = format_str.replace(/DD/g, d0);
  let name = document.getElementById("name").value
  // FirebaseのDatabaseに書き込み
  writeEvent(format_str, name);
  // console.log(format_str);
  document.getElementById("form-text-" + format_str).innerHTML = name;
  document.getElementById(format_str).style.display = 'block';

};

function close(ele) {
  var target = ele.currentTarget;
  console.log(target);
  apple = target.getElementsByClassName('apple');
  let date = apple[0].id;
  //Firebase からデータを削除する
  firebase.database().ref('events/' + date).remove();
  apple[0].style.display = 'none';
  apple = target.getElementsByTagName('div');
  apple[1].textContent = '';
};

//イベントの書き込み
function writeEvent(date, name) {
  firebase.database().ref('events/' + date).set({
    date: date,
    contents: name
  });
}
