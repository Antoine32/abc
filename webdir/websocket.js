socket.onopen = function (event) {
    console.log("WebSocket is open now.");
};

socket.onclose = function (event) {
    console.log("WebSocket is now closed.");
};

socket.onmessage = function (event) {
    let type = event.data.charAt(0);
    let content = event.data.substr(1);
    let elements = content.split(sepChar);

    switch (type) {
        case 'n':
            users[1].drawLines = [];
            users[1].drawing = true;
            break;

        case 'v':
            let i = content.charCodeAt(0);

            while (i > 0) {
                users[1].drawLines.push(createVector(content.charCodeAt(1), content.charCodeAt(2)));
                i--;
            }

            if (content.charCodeAt(1) > thisUser.max.x) {
                thisUser.max.x = content.charCodeAt(1);
            }
            if (content.charCodeAt(1) < thisUser.min.x) {
                thisUser.min.x = content.charCodeAt(1);
            }

            if (content.charCodeAt(2) > thisUser.max.y) {
                thisUser.max.y = content.charCodeAt(2);
            }
            if (content.charCodeAt(2) < thisUser.min.y) {
                thisUser.min.y = content.charCodeAt(2);
            }
            break;

        case 'e':
            save = true;
            users[1].drawing = false;
            break;

        case 'u':
            users.push(new user());
            users[users.length - 1].size = elements[0].charCodeAt(0);
            users[users.length - 1].color = color(elements[1]);
            for (let i = 2; i < elements.length; i++) {
                let j = elements[i].charCodeAt(0);
                while (j > 0) {
                    users[users.length - 1].drawLines.push(createVector(elements[i].charCodeAt(1), elements[i].charCodeAt(2)));
                    j--;
                }
            }
            break;
    }
}