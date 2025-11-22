
const PredictionPanel = {
    getElement() {
        const element = document.createElement('div');
        element.className = 'h-full';
        element.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p>예측 패널 준비 중...</p>
            </div>
        `;
        return element;
    }
};
