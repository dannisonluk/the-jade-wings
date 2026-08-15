import type { Locale } from "./config";

export type Messages = {
	navigation: {
		home: string;
		services: string;
		lounges: string;
		loungesDescription: string;
		cabins: string;
		cabinsDescription: string;
		flightNetwork: string;
		schedule: string;
		scheduleDescription: string;
		network2d: string;
		network2dDescription: string;
		network3d: string;
		network3dDescription: string;
		playground: string;
		routeVisualizer: string;
		routeVisualizerDescription: string;
		fleet: string;
		fleetDescription: string;
		chatbot: string;
		chatbotDescription: string;
		worldOfAirports: string;
		worldOfAirportsDescription: string;
		aboutProject: string;
		about: string;
		aboutDescription: string;
		faq: string;
		faqDescription: string;
		openMenu: string;
		closeMenu: string;
		mainMenu: string;
		language: string;
	};
	footer: string;
};

const messages: Record<Locale, Messages> = {
	en: {
		navigation: {
			home: "Home",
			services: "Services and Amenities",
			lounges: "Lounge Guide",
			loungesDescription: "Get the most out of your lounge visit",
			cabins: "Cabin Guide",
			cabinsDescription: "Pick among the exception comfort",
			flightNetwork: "Flight Schedule / Network",
			schedule: "Flight Schedule",
			scheduleDescription: "Weekly schedules for all flights",
			network2d: "2D Route Network",
			network2dDescription: "Discover global coverage and destinations",
			network3d: "3D Route Network",
			network3dDescription: "Explore the same network on a 3D globe",
			playground: "Fans & Playground",
			routeVisualizer: "Flying Route Visualizer",
			routeVisualizerDescription: "View the actual route of your flight",
			fleet: "Cathay Fleet",
			fleetDescription: "Explore fleets' specs and configurations",
			chatbot: "Chatbot about Cathay",
			chatbotDescription:
				"Temporarily offline due to high API and vector DB costs",
			worldOfAirports: "World of Airports",
			worldOfAirportsDescription: "Find HKG alliance friends and exchange game IDs",
			aboutProject: "About This Project",
			about: "Message From Developer",
			aboutDescription: "Some information you should know",
			faq: "Frequently Asked Questions",
			faqDescription: "Common travel topics and references",
			openMenu: "Open menu",
			closeMenu: "Close menu",
			mainMenu: "Main menu",
			language: "Language",
		},
		footer: "Non-Official | The Jade Wings",
	},
	"zh-HK": {
		navigation: {
			home: "主頁",
			services: "服務與設施",
			lounges: "貴賓室指南",
			loungesDescription: "規劃你的國泰貴賓室體驗",
			cabins: "客艙指南",
			cabinsDescription: "比較客艙、座椅及機上服務",
			flightNetwork: "航班時間表與航線網絡",
			schedule: "航班時間表",
			scheduleDescription: "瀏覽現行貨運航班時間表",
			network2d: "2D 航線網絡",
			network2dDescription: "在世界地圖探索航點",
			network3d: "3D 航線網絡",
			network3dDescription: "在 3D 地球探索航線網絡",
			playground: "航空迷專區",
			routeVisualizer: "飛行路線視覺化",
			routeVisualizerDescription: "重播實際歷史飛行軌跡",
			fleet: "國泰機隊",
			fleetDescription: "查看客機規格與配置",
			chatbot: "國泰聊天機械人",
			chatbotDescription: "因 API 與向量資料庫成本，目前暫停服務",
			worldOfAirports: "World of Airports",
			worldOfAirportsDescription: "交換 HKG 聯盟遊戲 ID",
			aboutProject: "關於本項目",
			about: "開發者的話",
			aboutDescription: "項目範圍、資料來源與限制",
			faq: "常見問題",
			faqDescription: "常見旅遊主題與參考資料",
			openMenu: "開啟選單",
			closeMenu: "關閉選單",
			mainMenu: "主選單",
			language: "語言",
		},
		footer: "非官方網站 | The Jade Wings",
	},
};

export function getMessages(locale: Locale): Messages {
	return messages[locale];
}
