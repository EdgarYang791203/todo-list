var btns = document.querySelectorAll(".button");
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
    });
}

var nowPage = "all";

$(document).ready(function () {
    $(btns[0]).click(function () {
        nowPage = "all";
        $(".task-card").show();
    });

    $(btns[1]).click(function () {
        nowPage = "progress";
        $(".task-card").show();
        $("h2.done").parent().parent().hide();
    });

    $(btns[2]).click(function () {
        nowPage = "completed";
        $(".task-card").hide();
        $("h2.done").parent().parent().show();
    });

    $(".addTask").focus(function (e) {
        $("#card").removeClass("hidden");
    });

    $(".addTask").keydown(function () {
        $(".to-add").addClass("keydown");
    });

    $(".addTask").keyup(function (e) {
        if (e.target.value === "") {
            $(".to-add").removeClass("keydown");
        }
        if (e.keyCode == 13) {
            if (e.target.value.length == 0) {
                return;
            }
            $("#taskTitle").text($(this).val());
        }
    });

    $("#cancel").click(function (e) {
        e.preventDefault();
        $("#taskTitle").text("Type Something Up...");
        $("#card").addClass("hidden");
    });

    $("#fa-star").click(function () {
        $("#fa-star").toggleClass("empty")
            .toggleClass("fas")
            .toggleClass("important")
            .toggleClass("far");
        $("#cheader").toggleClass("important-bg");
    });

    $(document).on("click", ".cheader", function (e) {
        if (e.target.id == "edit") {
            $(this).nextAll().removeClass("hidden");
        }
    });

    $(document).on("click", ".cfooter", function (e) {
        e.preventDefault();
        if ($(e.target).hasClass("closeEdit")) {
            $(this).prev().addClass("hidden");
            $(this).addClass("hidden");
        }
    });
});
var taskRef = db.collection("tasks");
$("#saveTask").on("click", saveTask);

var storageRef = storage.ref();
var upload;
$("#file").change(function () {
    console.log(this.files);
    var file = this.files[0];
    console.log(file.name);
    var fileRef = storageRef.child(file.name);
    fileRef.put(file).then(function (snapshot) {
        console.log(snapshot.downloadURL);
        console.log(snapshot);
        upload = {
            name: file.name,
            fileURL: snapshot.downloadURL,
            contentType: snapshot.metadata.contentType
        };
    });
});

function saveTask() {
    var task = {
        taskTitle: $("#taskTitle").text(),
        dateline: {
            "date": $("#dateInput").val(),
            "time": $("#timeInput").val()
        },
        comment: $("#comment").val(),
        done: false,
        important: false,
        createTime: new Date(),
    };

    if (upload !== undefined) {
        task.file = upload;
    }
    if ($("#fa-star").hasClass("important")) {
        task.important = true;
    }
    taskRef.add(task)
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });

    $(".addTask").val("");
    $("#taskTitle").text("Type Something Up...");
    $("#dateInput").val("");
    $("#timeInput").val("");
    $("#comment").val("");
    if ($("#fa-star").hasClass("important")) {
        $("#fa-star")
            .removeClass("important")
            .removeClass("fas")
            .addClass("far")
            .addClass("empty");
        $("#cheader").removeClass("important-bg");
    }
    $("#card").addClass("hidden");
}

taskRef.onSnapshot(function (snapshot) {
    snapshot.docChanges.forEach(function (change) {
        if (change.type === "added") {
            var $card = $(`<div class="task-card mb-3">
                <div class="cheader">
                    <h2 data-key="${change.doc.id}">${change.doc.data().taskTitle}</h2>
                    <i data-del="${change.doc.id}" class="fas fa-trash delete"></i>
                    <i data-key="${change.doc.id}" class="fa-star empty far"></i>
                    <i id="edit" class="fas fa-edit edit"></i>
                    <div class="showInformation">
                        <i class="far fa-calendar-alt icon"></i>
                        <span data-showdate="${change.doc.id}">${change.doc.data().dateline.date}</span>
                        <i class="far fa-comment-dots icon"></i>
                        <span data-showcomment="${change.doc.id}">${change.doc.data().comment}</span>
                    </div>
                </div>
                <div class="cbody hidden">
                    <div class="little-title">
                        <i class="far fa-calendar-alt icon"></i>
                        <h3>Deadline</h3>
                    </div>
                    <div class="card-content">
                        <input data-day="${change.doc.id}" type = "date" placeholder = "yy/mm/dd" value = "${change.doc.data().dateline.date}">
                        <input data-time="${change.doc.id}" type = "time" placeholder = "hh:mm" value = "${change.doc.data().dateline.time}">
                    </div>
                    <div class="little-title">
                        <i class="far fa-file icon"></i>
                        <h3>File</h3>
                    </div>
                    <div class="card-content">
                        <a href="#">
                            <i class="fas fa-plus-square plus-square"></i>
                        </a>
                    </div>
                    <div class="little-title">
                        <i class="far fa-comment-dots icon"></i>
                        <h3>Comment</h3>
                    </div>
                    <div class="card-content">
                        <textarea data-key="${change.doc.id}" name = "" placeholder = "Type your memo here…" >${change.doc.data().comment}</textarea>
                    </div>
                </div>
                <div class="cfooter hidden">
                    <a href="#" class="closeEdit">
                        <i class="fas fa-times closeEdit"></i>
                        <span class="closeEdit">Close</span>
                    </a>
                    <a href="#" data-save="${change.doc.id}" class="saveEdit">
                        <i data-save="${change.doc.id}" class="fas fa-plus"></i>
                        <span data-save="${change.doc.id}">Save</span>
                    </a>
                </div>
            </div>`);

            if (change.doc.data().file !== undefined) {
                var $downloadLink = $(` <a href="${change.doc.data().file.fileURL}" target="_blank">
                                            <i class="far fa-file icon"></i>
                                            ${change.doc.data().file.contentType}
                                        </a>`);
                $card.children(".cheader").children(".showInformation").append($downloadLink);
            }

            $card.appendTo($(".section-wrapping"));

            var $h2 = $(`h2[data-key=${change.doc.id}]`);
            if (change.doc.data().done) {
                $h2.addClass("done");
            }
            $h2.click(function (e) {
                taskRef
                    .doc(e.target.dataset.key)
                    .update({
                        done: !$h2.hasClass("done")
                    });
                $h2.toggleClass("done");
            });

            var $star = $(`i[data-key=${change.doc.id}]`);
            if (change.doc.data().important) {
                $star.toggleClass("empty")
                    .toggleClass("important")
                    .toggleClass("fas")
                    .toggleClass("far");
                $star.parent().toggleClass("important-bg");
            }
            $star.click(function (e) {
                if ($(e.target).hasClass("empty")) {
                    taskRef
                        .doc(e.target.dataset.key)
                        .update({
                            important: $star.hasClass("empty")
                        });
                } else {
                    taskRef
                        .doc(e.target.dataset.key)
                        .update({
                            important: $star.hasClass("empty")
                        });
                }
                $star.toggleClass("empty")
                    .toggleClass("important")
                    .toggleClass("fas")
                    .toggleClass("far");
                $star.parent().toggleClass("important-bg");
            });

            var $delete = $(`i[data-del=${change.doc.id}]`);
            $delete.click(function (e) {
                var $deleteId = e.target.dataset.del;
                db.doc(`/tasks/${$deleteId}`).delete();
                $(this).parent().parent().remove();
            });

            var $saveEdit = $(`a[data-save="${change.doc.id}"]`);
            var $saveDate = $(`input[data-day="${change.doc.id}"]`);
            var $saveTime = $(`input[data-time="${change.doc.id}"]`);
            var $saveComment = $(`textarea[data-key="${change.doc.id}"]`);
            var $showDate = $(`span[data-showdate="${change.doc.id}"]`);
            var $showComment = $(`span[data-showcomment="${change.doc.id}"]`)
            $saveEdit.click(function (e) {
                taskRef
                    .doc(e.target.dataset.save)
                    .update({
                        taskTitle: $h2.text(),
                        dateline: {
                            "date": $saveDate.val(),
                            "time": $saveTime.val()
                        },
                        comment: $saveComment.val(),
                        editTime: new Date()
                    });
                $(this).parent().addClass("hidden");
                $(this).parent().prev().addClass("hidden");
                $showDate.text($saveDate.val());
                $showComment.text($saveComment.val());
            });

            var taskLength = $(".task-card").length - $("h2.done").length;
            $("#quantity").text(`${checkTask()}`);

            function checkTask() {
                if (nowPage == "all" || nowPage == "progress") {
                    return `${taskLength} task left.`;
                } else if (nowPage == "completed") {
                    return `${$("h2.done").length} task completed.`;
                }
            }
        }
    });
});