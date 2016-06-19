var control = new Object();
control.logged = false;
control.web = 'https://api.newpsel.com/';
control.icon = control.web+'bundles/npsfrontend/images/logo_web.png';
control.tabTitle = '';
control.tabUrl = '';

function PageController($scope) {
  $scope.requestKey = function() {
    $scope.url = control.web+"chrome/request";
    var dataObject = new Object();
    dataObject.email = $('#email').val();
    $scope.sendData = JSON.stringify(dataObject);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", $scope.url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            var title;
            var message;
            if (resp.response) {
                title = "Done!";
                message = "We sent new key to your email.";
            } else {
                title = "Alert!";
                message = "Something went wrong.";
            }

            showNotification(title, message);
            if (resp.response) {
                setTimeout(
                    function() { window.close(); },
                    '100'
                );
            }
        }
    };
    xhr.send($scope.sendData);
  };

    $scope.doLogin = function() {
        $scope.url = control.web+"chrome/login";
        var dataObject = new Object();
        dataObject.appKey = $('#extension_key').val();
        $scope.sendData = JSON.stringify(dataObject);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", $scope.url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var resp = JSON.parse(xhr.responseText);
                var title;
                var message;
                if (resp.response) {
                    title = "Done!";
                    message = "You logged successfully";
                    $.cookie("newpsel_key", dataObject.appKey, { expires : 365 });
                    $.cookie("newpsel_logged", 1, { expires : 365 });
                } else {
                    title = "Alert!";
                    message = "Something went wrong. Contact to us.";
                }

                showNotification(title, message);
                if (resp.response) {
                    setTimeout(
                        function() { window.close(); },
                        '100'
                    );
                }
              }
        };
        xhr.send($scope.sendData);
    };
}

function fetchLabels(){
    var url = control.web+"chrome/labels";
    var dataObject = new Object();
    dataObject.appKey = $.cookie("newpsel_key");
    var sendData = JSON.stringify(dataObject);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.onreadystatechange = function() {
        var resp = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && resp.response) {
            showLabels(resp.labels);
        } else if (!resp.response) {
            var title = "Alert!";
            var message = "Something went wrong. Contact to us.";
            var notification = webkitNotifications.createNotification(control.icon, title,  message);
            notification.show();
            setTimeout(
                function() { notification.cancel(); },
                '3000'
            );
        }
    };
    xhr.send(sendData);
}

function getTabData()
{
    chrome.tabs.getSelected(null,function(tab) {
        control.tabTitle = tab.title;
        control.tabUrl = tab.url;
    });
}

function savePage(){
    $("#page-labels").on("click", ".label", function(event){
        var url = control.web+"chrome/add";
        var dataObject = new Object();
        dataObject.appKey = $.cookie("newpsel_key");
        dataObject.labelId = $(this).data('id');
        dataObject.webTitle = control.tabTitle;
        dataObject.webUrl = control.tabUrl;
        var sendData = JSON.stringify(dataObject);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var resp = JSON.parse(xhr.responseText);
                var title;
                var message;
                if (resp.response) {
                    title = "Done!";
                    message = "Page saved!";
                } else {
                    title = "Alert!";
                    message = "Something went wrong. Try again in few minutes.";
                }

                showNotification(title, message);
                setTimeout(
                    function() { window.close(); },
                    '100'
                );
            }
        };
        xhr.send(sendData);
    });
}

function showNotification(title, message){
    var opt = {
        type: "basic",
        title: title,
        message: message,
        iconUrl: "icon.png"
    };
    chrome.notifications.create("", opt, function(id) {
        console.error(chrome.runtime.lastError);
    });
}

function selectView(){
    $.cookie("newpsel_key");
    if ($.cookie("newpsel_logged") == 1) {
        $('#page-labels').removeClass('hide');
        getTabData();
        fetchLabels();
    } else {
        $('#page-welcome').removeClass('hide');
        var popup = $('#popup');
        popup.removeClass('backg-w');
        popup.addClass('backg-g');
    }
}

function showLabels(labels) {
    $.each(labels, function(i, val) {
        var content = '<li class="label" data-id="'+val.id+'"><a>'+val.name+'</a></li>';
        $("#page-labels ul").append(content);
    });
}

$(document).ready(function(){
    selectView();
    savePage();
});
