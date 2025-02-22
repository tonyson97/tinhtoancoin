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
    const historyHtml = calculations.map(calc => {
        if (calc.type === 'current_profit') {
            const profitClass = parseFloat(calc.profit) > 0 ? 'profit' : 'loss';
            const profitValue = parseFloat(calc.profit);
            const profitText = profitValue >= 0 ? 'Lãi' : 'Lỗ';
            const profitAbsValue = Math.abs(profitValue);
            return `
                <div class="history-item ${profitClass}">
                    <div class="history-time">${calc.timestamp}</div>
                    <div>Loại: Tính lãi lỗ hiện tại</div>
                    <div>Giá vào: ${calc.initialPrice} USD</div>
                    <div>Giá hiện tại: ${calc.currentPrice} USD</div>
                    <div>Đòn bẩy: ${calc.leverage}x</div>
                    <div>Vốn: ${calc.investment} USD</div>
                    <div>Thay đổi: ${calc.priceChange} USD (${calc.priceChangePercent}%)</div>
                    <div>${profitText}: ${profitAbsValue} USD</div>
                </div>
            `;
        } else {
            return `
                <div class="history-item">
                    <div class="history-time">${calc.timestamp}</div>
                    <div>Loại: Tính giá mục tiêu</div>
                    <div>Giá vào: ${calc.initialPrice} USD</div>
                    <div>Đòn bẩy: ${calc.leverage}x</div>
                    <div>Vốn: ${calc.investment} USD</div>
                    <div>Mục tiêu: ${calc.targetProfit} USD</div>
                    <div>Giá mục tiêu: ${calc.sellPrice} USD</div>
                    <div>Tăng: ${calc.percentageIncrease}%</div>
                </div>
            `;
        }
    }).join('');

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

// Thêm functions mới
function switchFeature(feature) {
    // Cập nhật active button
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchFeature('${feature}')"]`).classList.add('active');

    // Ẩn/hiện section tương ứng
    document.querySelectorAll('.feature-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${feature}-section`).classList.add('active');

    // Reset kết quả
    document.querySelectorAll('.result').forEach(result => {
        result.style.display = 'none';
    });

    // Nếu chuyển sang tính lãi lỗ, tự động focus vào ô nhập giá hiện tại
    if (feature === 'current') {
        document.getElementById('currentPrice').focus();
    }
}

function calculateCurrentProfit() {
    const initialPrice = parseFloat(document.getElementById('initialPrice').value);
    const currentPrice = parseFloat(document.getElementById('currentPrice').value);
    const leverage = parseFloat(document.getElementById('leverage').value);
    const investment = parseFloat(document.getElementById('investment').value);

    if (!currentPrice) {
        alert('Vui lòng nhập giá hiện tại');
        return;
    }

    if (!initialPrice || !leverage || !investment) {
        alert('Vui lòng điền đầy đủ thông tin ở phần thông tin chung');
        return;
    }

    const priceChange = currentPrice - initialPrice;
    const priceChangePercent = (priceChange / initialPrice) * 100;
    const profit = investment * leverage * (priceChangePercent / 100);

    const resultElement = document.getElementById('currentProfitResult');
    const profitText = profit >= 0 ? 'Lãi' : 'Lỗ';
    const profitAbsValue = Math.abs(profit);
    resultElement.innerHTML = `
        <strong>Kết quả lãi lỗ hiện tại:</strong><br>
        Thay đổi giá: ${priceChange.toFixed(3)} USD (${priceChangePercent.toFixed(2)}%)<br>
        ${profitText}: ${profitAbsValue.toFixed(2)} USD
    `;
    
    resultElement.classList.add('show');
    resultElement.classList.remove('profit', 'loss');
    resultElement.classList.add(profit > 0 ? 'profit' : 'loss');

    // Lưu kết quả vào history
    saveToLocalStorage({
        type: 'current_profit',
        initialPrice,
        currentPrice,
        leverage,
        investment,
        priceChange: priceChange.toFixed(3),
        priceChangePercent: priceChangePercent.toFixed(2),
        profit: profit.toFixed(2)
    });

    displayHistory();
}

function clearHistory() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) {
        localStorage.removeItem('calculations');
        displayHistory(); // Refresh lại phần hiển thị lịch sử
    }
} 