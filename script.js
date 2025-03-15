// Hàm định dạng số với dấu phẩy làm dấu thập phân
function formatNumber(number, decimals = 2) {
    if (isNaN(number) || number === null) return '0';
    
    // Làm tròn số đến số thập phân yêu cầu
    const fixed = parseFloat(number).toFixed(decimals);
    
    // Chia phần nguyên và phần thập phân
    const parts = fixed.toString().split('.');
    
    // Thêm dấu phân cách hàng nghìn cho phần nguyên
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Ghép lại với dấu phẩy làm dấu thập phân
    return parts.join(',');
}

// Hàm xử lý định dạng khi nhập vào input
function formatInputValue(inputElement) {
    let value = inputElement.value;
    
    // Chỉ giữ lại số và dấu phẩy/chấm
    value = value.replace(/[^\d.,]/g, '');
    
    // Chuyển đổi dấu chấm thành dấu phẩy
    value = value.replace(/\./g, ',');
    
    // Đảm bảo chỉ có một dấu phẩy
    const parts = value.split(',');
    if (parts.length > 2) {
        value = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Cập nhật giá trị input
    inputElement.value = value;
}

// Hàm lấy giá trị số từ input đã định dạng
function parseFormattedNumber(value) {
    if (!value) return 0;
    
    // Chuyển đổi định dạng số Việt Nam (dấu phẩy là dấu thập phân, dấu chấm là phân cách hàng nghìn)
    // sang định dạng JavaScript
    return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
}

// Kiểm tra giá trị hợp lệ
function validateInput(value, min = 0) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
}

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

function saveToLocalStorage(calculation) {
    // Thêm timestamp
    calculation.timestamp = new Date().toLocaleString();
    
    // Lấy lịch sử tính toán hiện tại từ localStorage
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    
    // Thêm kết quả tính toán mới vào cuối mảng
    history.push(calculation);
    
    // Giới hạn lịch sử tới 30 mục gần nhất
    const limitedHistory = history.slice(-30);
    
    // Lưu lại vào localStorage
    localStorage.setItem('calculationHistory', JSON.stringify(limitedHistory));
}

function displayHistory() {
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    const historyElement = document.getElementById('history');
    historyElement.innerHTML = '';

    // Take the last 10 calculations and reverse to show newest first
    const recentHistory = history.slice(-10).reverse();

    recentHistory.forEach(calc => {
        let historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        // Tính profit/loss class
        let profitLossClass = '';
        let profitLossText = '';
        let profitValue = 0;

        // Xử lý dựa vào loại tính toán
        if (calc.type === 'current_profit') {
            profitValue = parseFloat(calc.profit);
            profitLossClass = profitValue > 0 ? 'profit' : 'loss';
            profitLossText = profitValue > 0 ? 'Lãi' : 'Lỗ';

            historyItem.innerHTML = `
                <strong>Lãi/Lỗ hiện tại:</strong>
                <div>Giá ban đầu: ${formatNumber(calc.initialPrice, 3)} USD</div>
                <div>Giá hiện tại: ${formatNumber(calc.currentPrice, 3)} USD</div>
                <div>Đòn bẩy: ${formatNumber(calc.leverage, 1)}x</div>
                <div>Đầu tư: ${formatNumber(calc.investment, 2)} USD</div>
                <div>Thay đổi giá: ${formatNumber(calc.priceChange, 3)} USD (${formatNumber(calc.priceChangePercent, 2)}%)</div>
                <div class="${profitLossClass}">${profitLossText}: ${formatNumber(Math.abs(profitValue), 2)} USD</div>
            `;
        } else if (calc.type === 'spot') {
            profitValue = parseFloat(calc.profit);
            profitLossClass = profitValue > 0 ? 'profit' : 'loss';
            profitLossText = profitValue > 0 ? 'Lãi' : 'Lỗ';

            historyItem.innerHTML = `
                <strong>Spot:</strong>
                <div>Giá ban đầu: ${formatNumber(calc.initialPrice, 3)} USD</div>
                <div>Giá mục tiêu: ${formatNumber(calc.targetPrice, 3)} USD</div>
                <div>Đầu tư: ${formatNumber(calc.investment, 2)} USD</div>
                <div>Số coin: ${formatNumber(calc.coinAmount, 6)}</div>
                <div>Thay đổi giá: ${formatNumber(calc.priceChangePercent, 2)}%</div>
                <div class="${profitLossClass}">${profitLossText}: ${formatNumber(Math.abs(profitValue), 2)} USD</div>
            `;
        } else {
            // Target price calculation history
            historyItem.innerHTML = `
                <strong>Đích đến giá:</strong>
                <div>Giá ban đầu: ${formatNumber(calc.initialPrice, 3)} USD</div>
                <div>Đòn bẩy: ${formatNumber(calc.leverage, 1)}x</div>
                <div>Đầu tư: ${formatNumber(calc.investment, 2)} USD</div>
                <div>Mục tiêu lãi: ${formatNumber(calc.targetProfit, 2)} USD</div>
                <div>Giá bán: ${formatNumber(calc.sellPrice, 3)} USD</div>
                <div>Tăng giá: ${formatNumber(calc.percentageIncrease, 2)}%</div>
            `;
        }

        // Add the history item to the history element
        historyElement.appendChild(historyItem);
    });
}

function calculate() {
    // Get input values
    const initialPrice = parseFormattedNumber(document.getElementById('initialPrice').value);
    const leverage = parseFormattedNumber(document.getElementById('leverage').value);
    const investment = parseFormattedNumber(document.getElementById('investment').value);
    const targetProfit = parseFormattedNumber(document.getElementById('targetProfit').value);

    // Validate inputs
    if (!validateInput(initialPrice) || !validateInput(leverage, 1) || 
        !validateInput(investment) || !validateInput(targetProfit)) {
        alert('Vui lòng điền đầy đủ thông tin với giá trị hợp lệ');
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
        đích đến giá: ${formatNumber(sellPrice, 3)} USD<br>
        tăng giá bao nhiêu %: ${formatNumber(percentageIncrease, 2)}%
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
    const initialPrice = parseFormattedNumber(document.getElementById('initialPrice').value);
    const currentPrice = parseFormattedNumber(document.getElementById('currentPrice').value);
    const leverage = parseFormattedNumber(document.getElementById('currentLeverage').value);
    const investment = parseFormattedNumber(document.getElementById('investment').value);

    if (!validateInput(currentPrice)) {
        alert('Vui lòng nhập giá hiện tại hợp lệ');
        return;
    }

    if (!validateInput(initialPrice) || !validateInput(leverage, 1) || !validateInput(investment)) {
        alert('Vui lòng điền đầy đủ thông tin với giá trị hợp lệ');
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
        Thay đổi giá: ${formatNumber(priceChange, 3)} USD (${formatNumber(priceChangePercent, 2)}%)<br>
        ${profitText}: ${formatNumber(profitAbsValue, 2)} USD
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
        localStorage.removeItem('calculationHistory');
        displayHistory(); // Refresh lại phần hiển thị lịch sử
    }
}

function calculateSpotTarget() {
    const initialPrice = parseFormattedNumber(document.getElementById('initialPrice').value);
    const targetPrice = parseFormattedNumber(document.getElementById('spotTargetPrice').value);
    const investment = parseFormattedNumber(document.getElementById('investment').value);

    if (!validateInput(targetPrice)) {
        alert('Vui lòng nhập giá mục tiêu hợp lệ');
        return;
    }

    if (!validateInput(initialPrice) || !validateInput(investment)) {
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
        Giá ban đầu: ${formatNumber(initialPrice, 3)} USD<br>
        Giá mục tiêu: ${formatNumber(targetPrice, 3)} USD<br>
        Số tiền đầu tư: ${formatNumber(investment, 2)} USD<br>
        Số coin quy đổi: ${formatNumber(coinAmount, 6)}<br>
        Thay đổi giá: ${formatNumber(priceChange, 3)} USD<br>
        ${changeText}: ${formatNumber(changeAbsValue, 2)}%<br>
        ${profitText}: ${formatNumber(profitAbsValue, 2)} USD
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