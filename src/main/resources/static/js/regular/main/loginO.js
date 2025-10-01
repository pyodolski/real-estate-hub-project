// 초기값 false로 두고 시작
var isProfilePanelOpen = false;
var isChatPanelOpen = false; // 이거도 같은 에러 났었죠

// loginO.html 상단(해당 스크립트보다 먼저) 또는 공용 JS에
window.isChatPanelOpen = window.isChatPanelOpen ?? false;
