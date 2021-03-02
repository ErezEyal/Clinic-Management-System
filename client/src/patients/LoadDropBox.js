
class DropBoxPreview {
    constructor(element) {
        this.embedded = null;
        this.element = element;
        this.loadDropBoxScript();
    }

    loadDropBoxScript() {
        const existingScript = document.getElementById('dropboxjs');
        if (!existingScript) {
            console.log("adding script");
            const script = document.createElement('script');
            script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
            script.id = 'dropboxjs';
            script.setAttribute('data-app-key', 'l85uwpgzi53pk7p');
            document.body.appendChild(script);
        }
    }

    loadPhoto(url) {
        console.log(url)
        if (this.embedded) {
            this.unload();
        }

        const options = {
            link: url,
            file: {
                zoom: "best"
            },
            folder: {
                view: "list",
                headerSize: "normal"
            }
        };

        if (window.Dropbox) {
            const content = window.Dropbox.embed(options, this.element);
            this.embedded = content;
        }
        else {
            console.log("no dropbox object");
        }
    }

    unload() {
        if (this.embedded) {
            window.Dropbox.unmount(this.embedded);
            this.embedded = null;
        }
    }
}

export default DropBoxPreview;