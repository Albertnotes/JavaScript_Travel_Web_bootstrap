//DOM
const data = document.querySelector("#dataContainer");
const page = document.querySelector("#pageContainer");
const selectZone = document.querySelector('#selectZoneContainer');
const popularssZone = document.querySelector('#popularssZone');
const zoneTitle = document.querySelector('#zoneTitle');

// Model
// 宣告陣列變數，用以儲存資料庫
const allData = []; //全地區資料庫，複數以上的函式會使用到，所以寫在全域
const zoneData = []; // 特定地區資料庫，複數以上的函式會使用到，所以寫在全域

// 使用 IIFE 函式
(function getText() {
	// 建立物件
	const request = new XMLHttpRequest();
	// 設定請求
	request.open(
		"get",
		"https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97"
	);
	// 使用非同步處理的話，必須定義事件監聽
	request.onreadystatechange = function () {
		// 如果回應已完成 4 並且已成功 200 。
		if (request.readyState === 4 && request.status === 200) {
			// 以 JSON 解析字串轉為物件
			const data = JSON.parse(request.responseText);
			// 抓取資料層陣列長度
			const dataLen = data.result.records.length;
			// 使用 for 迴圈 以索引值 push 到 allData 全地區資料庫
			for (let i = 0; dataLen > i; i++) {
				allData.push(data.result.records[i]);
			}
			upMenu(allData)
			pagination(allData, 1);
		}
	};
	request.send(null);
})();

function pagination(importData, displayPage) {
	// 參數 "取得總資料筆數"
	const alldataTotal = importData.length;
	// 設定 "單頁顯示筆數"
	const eachdataTotal = 6;
	// 計算 "總資料筆數" / "單頁顯示筆數" 等於 "總頁數"
	// 使用 Math.ceil 確定數值為整數
	const pageTotal = Math.ceil(alldataTotal / eachdataTotal);
	// 參數 "取得當前頁數"
	let currentPage = displayPage;
	// 原則上，整體邏輯函式完整，但避免不可預知的因素。
	// 例如請觀看膽小狗英雄 - 發神經篇 - 主角displayPage
	// 若 "當前頁數" 大於 "總頁數" 時，增加 判斷 "當前頁數"就等於"總頁數"
	if (currentPage > pageTotal) {
		currentPage = pageTotal;
	}
	// 計算 "當前頁顯示筆數"，"起始點" 與 "結束點"
	const minNumber = currentPage * eachdataTotal - eachdataTotal + 1;
	const maxNumber = currentPage * eachdataTotal;
	// 假設 當前頁 為 x = 5
	// (x * 6) - 6 + 1 = 25  起始點 +1 是因為陣列 以 0 起算
	// (x * 6) = 30 結束點
	// 先準備空陣列，它是分頁資料庫
	const pageData = [];
	// 以參數(資料庫)使用 forEach 功能跟 for 相同可以加入索引值。
	importData.forEach((element, index) => {
		const number = index + 1;
		if (number >= minNumber && number <= maxNumber) {
			pageData.push(element);
		}
	});
	// --- 下面是解釋 - 請自己比對我說哪行，因為太過嘮叨就放在下面 ---
	// 為什麼 number 要 +1，因為陣列以 0 起算要 +1
	// 不想 +1 的話則結束點要 -1 並移除起始點 +1
	// 不過以我們小學運算邏輯，我們就使用 1 起算 +1 唄
	// 這邊的判斷以上方 x = 5 為例，起始點 25 結束點 30
	// 設 number 為 y
	// y >= 25 並且 y <= 30 回傳 true
	// 那麼什麼時候會是 true。
	// 當迴圈第一圈索引值 0 + 1 = number，那麼 number 就會是 1
	// 這個時候執行 push，會把參數(資料庫)的陣列索引值 0 push 上去。
	// 那為什麼是 0 ，因為陣列是以 0 開始起算阿! 老師在講有沒有在聽???
	// 故 x = 5 的時候，起始點 25 結束點 30 它會怎麼跑呢??
	// number = 25 ~ 30 會是 true
	// number = 1 ~ 24 與 31 ~ 100 會是 false
	// 說完覺得上述兩行是廢話 XDD，但是想一下應該可以理解齁
	// 所以當 true 就會 push 索引值陣列 = 24 ~ 29
	// 不要再問為什麼是 24 ~ 29 打你齁
	// 建立物件彙總，產生按鈕需要的訊息。
	const pageManager = {
		pageTotal, // 總頁碼
		currentPage, // 當前頁碼
		pre: currentPage > 1, // 上一頁判斷式
		next: currentPage < pageTotal // 下一頁判斷式
	};

	// 上一頁判斷式
	// 假設 "當前頁" 5  > 1 表示成立
	// 因為有 1.2.3.4 可以往前切
	// 假設 "當前頁" 1 > 1 表示不成立
	// 因為 你在第 1 頁啊!

	// 下一頁判斷式
	// 假設 "當前頁" 5  < "總頁碼" 6 表示成立
	// 因為還可以往後切換 1頁
	// 假設 "當前頁" 6 < "總頁碼" 6 表示不成立
	// 因為你在第 6 頁啊!
	pageBtn(pageManager); // 產生 分頁按鈕
	dataHtml(pageData); // 使用分頁資料庫，限制動態產生 HTML 的數量 
}

// view
//以 pagination 函式 彙總物件為參數
function pageBtn(parameter) {
	// 宣告變數 "總頁碼" 使用於 for 迴圈 (負責產生頁碼) 的結束點
	const pageTotal = parameter.pageTotal;
	// 宣告組合字串
	let str = '';
	// 這邊就是 Model篇 "上一頁判斷式" 的布林值
	if (parameter.pre) {
		// 當發生 true 的時候，為正常狀態可以點擊呈現藍色狀態
		// ${Number(parameter.currentPage) - 1} 
		// 意思是 "當前頁碼 - 1" 點擊後，以這個數值為參數導入 pagination 函式
		// 則分頁資料庫 pageData 就會改變，索引值就會回到上一頁
		str += `
		<li class="page-item">
			<a class="page-link" href="#" data-pages="${Number(parameter.currentPage) - 1}">
				< prev
			</a>
		</li>
		`;
	} else {
		// 當發生 false 的時候，加上 disabled Class 不能點擊呈現灰色狀態
		str += `
		<li class="page-item disabled">
			<a class="page-link" href="#">
				< prev
			</a>
		</li>
		`;
	}
	// for 迴圈增加頁碼，pageTotal為中斷點
	// 注意這邊是 >= 因為 "總頁碼" 5 時，還是要執行 1次 必須加上 =
	for (let i = 1; pageTotal >= i; i++) {
		// 當 "當前頁碼" 與 迴圈 i 相同時，則代表處於當前頁 故增加 active Class 呈現藍色背景點擊狀態
		if (Number(parameter.currentPage) === i) {
			str += `
			<li class="page-item active">
				<a class="page-link" href="#" data-pages="${i}">${i}</a>
			</li>
			`;
		} else {
			// 反之其他頁碼時，就沒有 active Class 
			str += `
			<li class="page-item">
				<a class="page-link" href="#" data-pages="${i}">${i}</a>
			</li>
			`;
		}
	}
	// 這邊就是 Model篇 "下一頁判斷式" 的布林值
	if (parameter.next) {
		// 當發生 true 的時候，為正常狀態可以點擊呈現藍色狀態
		// ${Number(parameter.currentPage) + 1} 
		// 意思是 "當前頁碼 + 1" 點擊後，以這個數值為參數導入 pagination 函式
		// 則分頁資料庫 pageData 就會改變，索引值就會來到下一頁
		str += `
		<li class="page-item"> 
			<a class="page-link" href="#" data-pages="${Number(parameter.currentPage) + 1}">
				next >
			</a>
		</li>
		`;
	} else {
		// 當發生 false 的時候，加上 disabled Class 不能點擊呈現灰色狀態
		str += `
		<li class="page-item disabled">
			<a class="page-link" href="#">
				next >
			</a>
		</li>
		`;
	}
	page.innerHTML = str;
}

function dataHtml(parameter) {
	let str = "";
	for (let i = 0; i < parameter.length; i++) {
		str += `
		<div class="col-md-6 mb-3">
			<div class="card">
				<div class="card border-0">
					<img src="${parameter[i].Picture1}" class="card-img-top img-fluid" alt="" style="max-height: 220px">
					<div class="card-img-overlay d-flex align-items-end justify-content-between text-white">
						<h4 class="card-text mb-0">${parameter[i].Name}</h4>
						<p class="card-text">${parameter[i].Zone}</p>
					</div>
				</div>
				<div class="card-body">
					<p class="card-text date">${parameter[i].Opentime}</p>
					<p class="card-text address">${parameter[i].Add}</p>
					<div class="d-flex justify-content-between">
						<p class="card-text tel">${parameter[i].Tel}</p>
						<p class="card-text mb-3 teg">${parameter[i].Ticketinfo}</p>
					</div>
				</div>
			</div>
		</div>
		`;
	}
	data.innerHTML = str;
}

function upMenu(parameter) {
	// 先準備空陣列，它是地區資料庫
	const tempArrayZone = [];
	for (let i = 0; parameter.length > i; i++) {
		tempArrayZone.push(allData[i].Zone);
	}
	// 過濾重覆 地區
	const noRepeatZone = Array.from(new Set(tempArrayZone));
	const noRepeatZoneLen = noRepeatZone.length;
	// view
	for (let i = 0; i < noRepeatZoneLen; i++) {
		const addOption = document.createElement('Option');
		addOption.textContent = noRepeatZone[i];
		addOption.setAttribute('value', noRepeatZone[i])
		selectZone.appendChild(addOption);
	}
	// 這是地區判斷值，留給分頁按鈕函式
	// 判斷現在頁面地區，是顯示哪一個地區，預設 HTML 是隱藏的
	zoneTitle.textContent = '全部地區';
};

// controller
function chickZone(e) {
	// 阻止元素默認的行為
	e.preventDefault();
	// 不是 A 元素的傢伙退散!!
	if (e.target.nodeName !== 'A') { return };
	// 特定地區資料庫 zoneData
	// 執行前先清空上一個函式可能 push 的資料
	zoneData.length = 0;
	// 這是地區判斷值，留給分頁按鈕函式
	// 判斷現在頁面地區，是顯示哪一個地區，預設 HTML 是隱藏的
	zoneTitle.textContent = e.target.textContent;
	// 設計上，有全部地區，故這邊有 switch 
	// 比對 表達式 裡頭的值是否符合 case 條件
	switch (true) {
		// 當點擊數值，不是全部地區
		case e.target.textContent !== '全部地區':
			// 組合特定地區資料庫 zoneData
			for (let i = 0; allData.length > i; i++) {
				// 如果點擊地區與陣列地區相同時，則 push 該陣列索引值
				if (e.target.textContent === allData[i].Zone) {
					zoneData.push(allData[i]);
				}
			}
			// 以 "特定地區資料庫" 為 "資料庫參數"
			pagination(zoneData, 1);
			break
		// 預設 
		default:
			// 以 "全地區資料庫" 為 "資料庫參數"
			pagination(allData, 1);
			break
	}
}

function changeZone(e) {
	// 特定地區資料庫 zoneData
	// 執行前先清空上一個函式可能 push 的資料
	zoneData.length = 0;
	// 這是地區判斷值，留給分頁按鈕函式
	// 判斷現在頁面地區，是顯示哪一個地區，預設 HTML 是隱藏的
	zoneTitle.textContent = e.target.value;
	// 設計上，有全部地區，故這邊有 switch 
	// 比對 表達式 裡頭的值是否符合 case 條件
	switch (true) {
		// 當點擊數值，不是全部地區
		case e.target.value !== '全部地區':
			// 組合特定地區資料庫 zoneData
			for (let i = 0; allData.length > i; i++) {
				// 如果點擊地區與陣列地區相同時，則 push 該陣列索引值
				if (e.target.value === allData[i].Zone) {
					zoneData.push(allData[i]);
				}
			}
			// 以 "特定地區資料庫" 為 "資料庫參數"
			pagination(zoneData, 1);
			break
		// 預設 
		default:
			// 以 "全地區資料庫" 為 "資料庫參數"
			pagination(allData, 1);
			break
	}
}

function clickPage(e) {
	// 阻止元素默認的行為
	e.preventDefault();
	// 不是 A 元素的傢伙退散!!
	if (e.target.nodeName !== 'A') { return };
	// 抓取點擊按鈕的 data 值，為參數導入 pagination函式
	const page = e.target.dataset.pages;
	// zoneTitle 是我們在選單及地區，新增的地區判斷值
	// 可以使用於這裡，提供其他函式判斷整體頁面的狀態。
	switch (true) {
		case zoneTitle.textContent !== '全部地區':
			// 當全部地區以外時，特定地區資料庫會有資料。
			pagination(zoneData, page);
			break
		default:
			// 預設使用全地區資料庫。
			pagination(allData, page);
			break
	}
}

page.addEventListener('click', clickPage);
selectZone.addEventListener('change', changeZone);
popularssZone.addEventListener('click', chickZone);

