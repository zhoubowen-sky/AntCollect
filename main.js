
var collectTimes = 20;

mainEntrence();

// 获取权限和设置参数
function prepareThings() {
    setScreenMetrics(1080, 2340);
    // 请求截图权限
    if (!requestScreenCapture()) {
        toast("请求截图失败,脚本退出");
        exit();
    }
    toast("请求截图权限成功");
}

// 截图
function getCaptureImg() {
    sleep(500);
    var img0 = captureScreen();
    sleep(100);
    if (img0 == null || typeof (img0) == "undifined") {
        toastLog("截图失败,脚本退出");
        exit();
    } else {
        return img0;
    }
}

// 从支付宝主页进入蚂蚁森林我的主页
function enterMyMainPage() {
    click("蚂蚁森林");
    sleep(1500);
    // 收自己能量
    clickByTextDesc("克", 0);
    toast("自己能量收集完成");
    sleep(500);
    return true;
}

// 进入总排行榜
function enterRank() {
    toast("进入排行榜");
    click("总排行榜");
    sleep(1500);

    toast("查看更多好友");
    click("查看更多好友");
    sleep(1500);
    return true;
}

// 从排行榜获取可收集好友的点击位置
function getHasEnergyfriend(type) {
    var img = getCaptureImg();
    var p = null;
    if (type == 1) {
        // 区分倒计时和可收取能量的小手
        p = images.findMultiColors(img, "#ffffff", [[0, -35, "#1da06d"], [0, 23, "#1da06d"]], {
            region: [1073, 200, 1, 2000]
        });
    }
    if (p != null) {
        toast("找到好友");
        return p;
    } else {
        toast("此页没有找到可收能量的好友");
        return null;
    }
}

// 在排行榜页面,循环查找可收集好友
function enterOthers() {
    var i = 1;
    var ePoint = getHasEnergyfriend(1);

    // 需要确保当前操作是在排行榜界面
    // 不断滑动，查找好友
    while (ePoint == null) {
        // TODO 需要判断当前是否在排行榜页面
        swipe(520, 1800, 520, 300, 500);
        sleep(100);
        ePoint = getHasEnergyfriend(1);
        i++;

        //如果检测到结尾，同时也没有可收能量的好友，那么结束收取
        if (textEndsWith("没有更多了").exists() || descEndsWith("没有更多了").exists()) {
            toast("当前已经到最后一页了");
            if (ePoint == null) {
                return true;
            }
        }

        //如果连续 collectTimes 次都未检测到可收集好友,无论如何停止查找(由于程序控制了在排行榜界面,且判断了结束标记,基本已经不存在这种情况了)
        if (i > collectTimes) {
            toast("程序可能出错,连续" + i + "次未检测到可收集好友");
            return false;
        }
    }

    //找到好友
    //进入好友页面
    click(ePoint.x, ePoint.y + 20);
    sleep(500);

    //收好友能量
    clickByTextDesc("克", 0);
    sleep(500);

    //等待返回好友排行榜
    back();
    var j = 0;
    if (!textEndsWith("周排行榜").exists() && !descEndsWith("周排行榜").exists() && j <= 10) {
        sleep(1000);
        j++;
    }
    if (j >= 10) {
        toastLog("返回排行榜失败");
        return false;
    }
    //返回排行榜成功，继续
    enterOthers();
}

// 点击空间方法
function clickByTextDesc(energyType, paddingY) {
    var clicked = false;
    if (descEndsWith(energyType).exists()) {
        descEndsWith(energyType).find().forEach(function (pos) {
            var posb = pos.bounds();

            click(posb.centerX(), posb.centerY());

            if (posb.centerX() < 0 || posb.centerY() - paddingY < 0) {
                return false;
            }

            var str = pos.id();
            if (str != null) {
                if (str.search("search") == -1) {
                    click(posb.centerX(), posb.centerY() - paddingY);
                    clicked = true;
                }
            } else {
                click(posb.centerX(), posb.centerY() - paddingY);
                clicked = true;
            }
            sleep(100);
        });
    } else {
        toast("没有找到符合条件的能量球1");
        sleep(2000);
    }

    if (textEndsWith(energyType).exists() && clicked == false) {
        textEndsWith(energyType).find().forEach(function (pos) {
            var posb = pos.bounds();
            click(posb.centerX(), posb.centerY());
            if (posb.centerX() < 0 || posb.centerY() - paddingY < 0) {
                return false;
            }

            var str = pos.id();
            if (str != null) {
                if (str.search("search") == -1) {
                    click(posb.centerX(), posb.centerY() - paddingY);
                    clicked = true;
                }
            } else {
                click(posb.centerX(), posb.centerY() - paddingY);
                clicked = true;
            }
            sleep(300);
        });
    } else {
        toast("没有找到符合条件的能量球2");
        sleep(1500);
    }
    return clicked;
}

// 结束后返回主页面
function whenComplete() {
    toastLog("结束");
    back();
    sleep(1500);
    back();
}

// 打开支付宝APP
function openAlipay() {
    launchApp("支付宝");
    toast("等待支付宝启动");
    sleep(1000);
    // 打开首页
    click("首页");
    return true;
}

//程序主入口
function mainEntrence() {
    // 前置准备操作
    prepareThings();
    // 打开支付宝APP
    openAlipay();
    // 进入蚂蚁森林主页,收集自己的能量
    enterMyMainPage();
    // 进入排行榜
    if (enterRank()) {
        //进入好友主页，收好友能量
        enterOthers();
    }
    //结束后返回主页面
    whenComplete();
    exit();
}