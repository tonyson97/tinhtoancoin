function calculateSellPrice(initialPrice, leverage, investment, targetProfit) {
    // Công thức tính giá bán để đạt được lợi nhuận mục tiêu với đòn bẩy
    // targetProfit = investment * leverage * (priceChangeRatio)
    // priceChangeRatio = (sellPrice - initialPrice) / initialPrice
    // Nên: targetProfit = investment * leverage * (sellPrice - initialPrice) / initialPrice
    // Do đó: sellPrice = initialPrice * (1 + targetProfit / (investment * leverage))
    
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
        } else if (calc.type === 'spot') {
            const profitClass = parseFloat(calc.priceChangePercent) > 0 ? 'profit' : 'loss';
            
            // Thêm thông tin lãi/lỗ
            const profitValue = parseFloat(calc.profit);
            const profitText = profitValue >= 0 ? 'Lãi' : 'Lỗ';
            const profitAbsValue = Math.abs(profitValue);
            
            return `
                <div class="history-item ${profitClass}">
                    <div class="history-time">${calc.timestamp}</div>
                    <div>Loại: Tính Spot</div>
                    <div>Giá vào: ${calc.initialPrice} USD</div>
                    <div>Giá mục tiêu: ${calc.targetPrice} USD</div>
                    <div>Số tiền đầu tư: ${calc.investment} USD</div>
                    <div>Số coin quy đổi: ${calc.coinAmount}</div>
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
        type: 'target_price',
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

    // Đồng bộ giá trị đòn bẩy giữa các phần
    if (feature === 'target') {
        // Nếu chuyển sang phần tính giá mục tiêu, lấy giá trị từ current nếu đã nhập
        const currentLeverage = document.getElementById('currentLeverage');
        const leverage = document.getElementById('leverage');
        if (currentLeverage.value && leverage) {
            leverage.value = currentLeverage.value;
        }
    } else if (feature === 'current') {
        // Nếu chuyển sang phần tính lãi lỗ hiện tại, lấy giá trị từ target
        const currentLeverage = document.getElementById('currentLeverage');
        const leverage = document.getElementById('leverage');
        if (leverage.value && currentLeverage) {
            currentLeverage.value = leverage.value;
        }
        document.getElementById('currentPrice').focus();
    } else if (feature === 'spot') {
        document.getElementById('spotTargetPrice').focus();
    }
}

function calculateCurrentProfit() {
    const initialPrice = parseFloat(document.getElementById('initialPrice').value);
    const currentPrice = parseFloat(document.getElementById('currentPrice').value);
    const leverage = parseFloat(document.getElementById('currentLeverage').value);
    const investment = parseFloat(document.getElementById('investment').value);

    if (!currentPrice) {
        alert('Vui lòng nhập giá hiện tại');
        return;
    }

    if (!initialPrice || !leverage || !investment) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    // Tính toán lãi lỗ dựa trên công thức:
    // profit = investment * leverage * priceChangePercent / 100
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

function calculateSpotTarget() {
    const initialPrice = parseFloat(document.getElementById('initialPrice').value);
    const targetPrice = parseFloat(document.getElementById('spotTargetPrice').value);
    const investment = parseFloat(document.getElementById('investment').value);

    if (!targetPrice) {
        alert('Vui lòng nhập giá mục tiêu');
        return;
    }

    if (!initialPrice || !investment) {
        alert('Vui lòng điền đầy đủ thông tin về giá mua và số tiền đầu tư ở phần thông tin chung');
        return;
    }

    // Tính số lượng coin dựa trên số tiền đầu tư
    const coinAmount = investment / initialPrice;
    
    // Tính toán phần trăm thay đổi giá
    const priceChange = targetPrice - initialPrice;
    const priceChangePercent = (priceChange / initialPrice) * 100;
    
    // Tính lãi/lỗ dựa trên số lượng coin quy đổi từ số tiền đầu tư
    const profit = priceChange * coinAmount;

    const resultElement = document.getElementById('spotProfitResult');
    const changeText = priceChangePercent >= 0 ? 'Tăng' : 'Giảm';
    const changeAbsValue = Math.abs(priceChangePercent);
    
    const profitText = profit >= 0 ? 'Lãi' : 'Lỗ';
    const profitAbsValue = Math.abs(profit);
    
    resultElement.innerHTML = `
        <strong>Kết quả Spot khi đạt mục tiêu:</strong><br>
        Giá ban đầu: ${initialPrice.toFixed(3)} USD<br>
        Giá mục tiêu: ${targetPrice.toFixed(3)} USD<br>
        Số tiền đầu tư: ${investment.toFixed(2)} USD<br>
        Số coin quy đổi: ${coinAmount.toFixed(6)}<br>
        Thay đổi giá: ${priceChange.toFixed(3)} USD<br>
        ${changeText}: ${changeAbsValue.toFixed(2)}%<br>
        ${profitText}: ${profitAbsValue.toFixed(2)} USD
    `;
    
    resultElement.classList.add('show');
    resultElement.classList.remove('profit', 'loss');
    resultElement.classList.add(priceChangePercent > 0 ? 'profit' : 'loss');

    // Lưu kết quả vào history
    saveToLocalStorage({
        type: 'spot',
        initialPrice,
        targetPrice,
        investment,
        coinAmount: coinAmount.toFixed(6),
        priceChange: priceChange.toFixed(3),
        priceChangePercent: priceChangePercent.toFixed(2),
        profit: profit.toFixed(2)
    });

    displayHistory();
} 