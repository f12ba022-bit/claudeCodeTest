// ドキュメントの読み込みが完了したら実行
$(document).ready(function() {
    console.log('jQuery is ready!');

    // 1. テキスト表示/非表示の切り替え
    $('#showText').click(function() {
        $('#hiddenText').slideToggle('slow');

        // ボタンのテキストを変更
        if ($('#hiddenText').is(':visible')) {
            $(this).text('非表示にする');
        } else {
            $(this).text('クリックしてください');
        }
    });

    // 2. フェードイン/フェードアウトの切り替え
    $('#fadeToggle').click(function() {
        $('#fadeBox').fadeToggle(1000);
    });

    // 3. スライドアニメーション
    $('#slideToggle').click(function() {
        $('#slideContent').slideToggle('slow');

        // ボタンのテキストを変更
        if ($('#slideContent').is(':visible')) {
            $(this).text('閉じる');
        } else {
            $(this).text('スライド切り替え');
        }
    });

    // 4. 色の変更
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    let colorIndex = 0;

    $('#changeColor').click(function() {
        colorIndex = (colorIndex + 1) % colors.length;
        $('#colorBox').css({
            'background-color': colors[colorIndex],
            'transform': 'scale(1.1)'
        }).animate({
            'transform': 'scale(1)'
        }, 300);
    });

    // 5. リストに項目を追加
    $('#addItem').click(function() {
        addItemToList();
    });

    // Enterキーでも追加できるようにする
    $('#itemInput').keypress(function(e) {
        if (e.which === 13) { // Enterキーのコード
            addItemToList();
        }
    });

    // リストに項目を追加する関数
    function addItemToList() {
        const itemText = $('#itemInput').val().trim();

        if (itemText !== '') {
            // 新しいリストアイテムを作成
            const newItem = $('<li></li>')
                .text(itemText)
                .hide()
                .appendTo('#itemList')
                .fadeIn('slow');

            // 項目をクリックすると削除できるようにする
            newItem.click(function() {
                $(this).fadeOut('slow', function() {
                    $(this).remove();
                });
            });

            // 入力フィールドをクリア
            $('#itemInput').val('').focus();
        } else {
            // 空の場合は入力フィールドを強調
            $('#itemInput').css({
                'border-color': '#fa709a',
                'background-color': '#ffe0e0'
            }).animate({
                'border-color': '#667eea',
                'background-color': 'white'
            }, 500);
        }
    }

    // ホバーエフェクト - デモボックス
    $('.demo-box').hover(
        function() {
            $(this).css('background-color', '#e9ecef');
        },
        function() {
            $(this).css('background-color', '#f8f9fa');
        }
    );

    // スクロールアニメーション - ページロード時にフェードイン
    $('.demo-box').each(function(index) {
        $(this).css('opacity', 0).delay(index * 100).animate({
            opacity: 1
        }, 800);
    });

    // ウェルカムメッセージ
    setTimeout(function() {
        console.log('ようこそ! jQueryのデモページです。各機能を試してみてください!');
    }, 1000);
});
