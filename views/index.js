$(function () {


    const server = require('./www.js').http;
    //var express = require('express');
    //var www = require('express')();
    //var http = require('http').createServer(www);
    const io = require('socket.io')(server);
    var socket = io();
    window.dataLayer = window.dataLayer || [];
    document.getElementById("submit").onclick = function genName() {
        if (document.getElementById("name").value == "")
            document.getElementById("name").value = "調查員" + Math.floor(Math.random() * 1000) + 1;
    }

    function scorllToBottom() {
        var content = document.getElementById("container-content");
        content.scrollTop = content.scrollHeight;
    }
    document.addEventListener("DOMContentLoaded", () => {
        var roomNumber = "公共房間"
        var max_record = 100;
        //  var status = document.getElementById("status");
        var online = document.getElementById("online");
        var room = document.getElementById("room");
        var roomText = document.getElementById("roomNumber");
        var changeRoomNumber = document.getElementById("changeRoomNumber-form");
        var sendForm = document.getElementById("send-form");
        var content = document.getElementById("content");
        var nameInputBox = document.getElementById("name");
        var msgInputBox = document.getElementById("msg");
        var name = getCookie("name");

        if (name) {
            nameInputBox.value = name;
        }
        /*
                socket.on("connect", function () {
                    status.innerText = "Connected.";
                });

                socket.on("disconnect", function () {
                    status.innerText = "Disconnected.";
                });
        */
        socket.on("online", function (amount) {
            online.innerText = amount;
        });

        socket.on("maxRecord", function (amount) {
            max_record = amount;
        });

        socket.on("chatRecord", async function (msgs) {
            msgs.sort(function (a, b) {
                return new Date(a.time) - new Date(b.time);
            });
            for (var i = 0; i < msgs.length; i++) {
                (async function () {
                    await addMsgToBox(msgs[i]);
                })();
            }
        });

        socket.on(roomNumber, addMsgToBox);

        changeRoomNumber.addEventListener("submit", async function (e) {
            e.preventDefault();
            if (!roomText.value) {
                roomText.innerHTML = "公共房間";
                roomText.value = "公共房間";
            }
            if (roomText.value == roomNumber) {
                return;
            }
            await socket.off(roomNumber);
            roomNumber = roomText.value;
            let myNode = document.getElementById("content");
            myNode.innerHTML = '';
            socket.emit("newRoom", roomNumber);
            room.innerText = roomNumber;
            await socket.on(roomNumber, addMsgToBox);
        });



        sendForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!msgInputBox) return;
            var formData = {
                time: new Date(Date.now())
            };
            formData.msg = msgInputBox.value;
            formData.name = nameInputBox.value;
            formData.roomNumber = roomNumber;
            console.log(formData)
            socket.emit("send", formData);
            setCookie("name", nameInputBox.value);

        });


        async function addMsgToBox(d) {
            var msgBox = document.createElement("div");
            msgBox.className = "card";
            var msgBoxHeader = document.createElement("div");
            msgBoxHeader.className = "card-header";
            var msgBoxBody = document.createElement("div");
            msgBoxBody.className = "card-body";

            var nameBox = document.createElement("span");
            nameBox.className = "badge badge-primary";
            var timeBox = document.createElement("span")
            timeBox.className = "badge badge-secondary";
            var name = document.createTextNode(d.name);

            var time = document.createTextNode(new Date(d.time).toLocaleString());
            var msg = document.createTextNode(d.msg, setTimeout(function () {
                scorllToBottom();
            }, 50));


            nameBox.appendChild(name);
            msgBoxHeader.appendChild(nameBox);
            msgBoxHeader.innerHTML += "&nbsp";
            timeBox.appendChild(time);
            msgBoxHeader.appendChild(timeBox);
            msgBoxBody.appendChild(msg);

            msgBox.appendChild(msgBoxHeader);
            msgBox.appendChild(msgBoxBody);
            content.appendChild(msgBox);

            if (content.children.length > max_record) {
                rmMsgFromBox();
            }
        }

        function rmMsgFromBox() {
            var childs = content.children;
            childs[0].remove();
        }

        function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }


        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }
    })
})