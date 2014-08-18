var control = new Object();
control.logged = false;
control.web = 'http://www.newpsel.com/';
control.icon = control.web+'bundles/npsfrontend/images/logo_web.png';
control.tabTitle = '';
control.tabUrl = '';

function PageController($scope) { 
  $scope.requestKey = function() {
    $scope.url = control.web+"api/chrome/request/";
    var dataObject = new Object();
    dataObject.email = $('#email').val();
    $scope.sendData = JSON.stringify(dataObject);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", $scope.url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            if (resp.response) {
                var title = "Done!";
                var message = "We sent new key to your email.";
            } else {
                var title = "Alert!";
                var message = "Something went wrong. Contact to us.";
            }

            var notification = webkitNotifications.createNotification(control.icon, title, message);
            notification.show();
            setTimeout(
                function() { notification.cancel(); },
                '3000'
            );
        }
    };
    xhr.send($scope.sendData);
  };

    $scope.doLogin = function() {
        $scope.url = control.web+"api/chrome/login/";
        var dataObject = new Object();
        dataObject.appKey = $('#extension_key').val();
        $scope.sendData = JSON.stringify(dataObject);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", $scope.url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var resp = JSON.parse(xhr.responseText);
                if (resp.response) {
                    var title = "Done!";
                    var message = "You logged successfully";
                    $.cookie("newpsel_key", dataObject.appKey, { expires : 365 });
                    $.cookie("newpsel_logged", 1, { expires : 365 });
                    window.close();
                } else {
                    var title = "Alert!";
                    var message = "Something went wrong. Contact to us.";
                }

                var notification = webkitNotifications.createNotification(control.icon, title,  message);
                notification.show();
                setTimeout(
                    function() { notification.cancel(); },
                    '3000'
                );
              }
        };
        xhr.send($scope.sendData);
    };
}

function fetchLabels(){
    var url = control.web+"api/chrome/labels/";
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
        var url = control.web+"api/chrome/add/";
        var dataObject = new Object();
        dataObject.appKey = $.cookie("newpsel_key");
        dataObject.labelId = $(this).data('id');
        dataObject.webTitle = control.tabTitle;
        dataObject.webUrl = control.tabUrl;
        var sendData = JSON.stringify(dataObject);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.onloadstart = function () {
            window.close();
        };
        /*xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var resp = JSON.parse(xhr.responseText);
                if (resp.response) {
                    var title = "Done!";
                    var message = "Page saved!";                    
                } else {
                    var title = "Alert!";
                    var message = "Something went wrong. Contact to us.";
                }

                var notification = webkitNotifications.createNotification(control.icon, title, message);
                notification.show();
                setTimeout(
                    function() {
                        notification.cancel();
                        
                    },
                    '500'
                );
            }
        };*/
        xhr.send(sendData);
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