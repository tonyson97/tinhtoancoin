function calculateSellPrice(initialPrice, leverage, investment, targetProfit) {
    let priceIncreaseRatio = targetProfit / (investment * leverage);
    let sellPrice = initialPrice * (1 + priceIncreaseRatio);
    return sellPrice;
}

function saveToLocalStorage(data) {
    // Get existing calculations or initialize empty array
    let calculations = JSON.parse(localStorage.getItem('calculations') || '[]');
    
    // Add timestamp to the data
    data.timestamp = new Date().toLocaleString('vi-VN');
    
    // Add new calculation to beginning of array
    calculations.unshift(data);
    
    // Keep only last 10 calculations
    if (calculations.length > 10) {
        calculations = calculations.slice(0, 10);
    }
    
    // Save back to localStorage
    localStorage.setItem('calculations', JSON.stringify(calculations));
}

function displayHistory() {
    const calculations = JSON.parse(localStorage.getItem('calculations') || '[]');
    const historyHtml = calculations.map(calc => `
        <div class="history-item">
            <div class="history-time">${calc.timestamp}</div>
            <div>Giá vào: ${calc.initialPrice} USD</div>
            <div>Đòn bẩy: ${calc.leverage}x</div>
            <div>Vốn: ${calc.investment} USD</div>
            <div>Mục tiêu: ${calc.targetProfit} USD</div>
            <div>Giá mục tiêu: ${calc.sellPrice} USD</div>
            <div>Tăng: ${calc.percentageIncrease}%</div>
        </div>
    `).join('');

    const historyElement = document.getElementById('history');
    if (historyElement) {
        historyElement.innerHTML = historyHtml;
    }
}

function calculate() {
    // Get input values
    const initialPrice = parseFloat(document.getElementById('initialPrice').value);
    const leverage = parseFloat(document.getElementById('leverage').value);
    const investment = parseFloat(document.getElementById('investment').value);
    const targetProfit = parseFloat(document.getElementById('targetProfit').value);

    // Validate inputs
    if (!initialPrice || !leverage || !investment || !targetProfit) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    // Calculate sell price
    const sellPrice = calculateSellPrice(initialPrice, leverage, investment, targetProfit);
    
    // Calculate percentage increase
    const percentageIncrease = ((sellPrice - initialPrice) / initialPrice) * 100;

    // Save calculation to localStorage
    saveToLocalStorage({
        initialPrice,
        leverage,
        investment,
        targetProfit,
        sellPrice: sellPrice.toFixed(3),
        percentageIncrease: percentageIncrease.toFixed(2)
    });

    // Display result
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `
        <strong>kết quả:</strong><br>
        đích đến giá: ${sellPrice.toFixed(3)} USD<br>
        tăng giá bao nhiêu %: ${percentageIncrease.toFixed(2)}%
    `;
    resultElement.classList.add('show');

    // Update history display
    displayHistory();
}

// Load history when page loads
document.addEventListener('DOMContentLoaded', displayHistory); 