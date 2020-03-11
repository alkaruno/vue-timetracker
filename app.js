var STORAGE_KEY = 'vue-timetracker';
var storage = {
    read: function () {
        if (localStorage.getItem(STORAGE_KEY)) {
            return JSON.parse(localStorage.getItem(STORAGE_KEY));
        }
        return [];
    },
    save: function (timers) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    }
};

new Vue({
    el: '#app',
    data: {
        timers: storage.read(),
        newTimer: '',
        activeTimer: null,
        editedTimer: null,
        position: 0
    },
    watch: {
        timers: {
            handler: function (timers) {
                storage.save(timers);
            },
            deep: true
        },
        activeTimer: {
            handler: function (activeTimer) {
                document.getElementById('favicon').href = activeTimer ? 'play.png' : 'pause.png';
            }
        }
    },
    mounted: function () {
        this.timers.forEach(function (timer) {
            if (timer.active) {
                this.activeTimer = timer;
            }
        }.bind(this));
        window.addEventListener('keydown', function (event) {
            switch (event.code) {
                case 'Space':
                    this.clickTimer(this.timers[this.position]);
                    break;
                case 'KeyJ':
                    this.position = Math.min(this.position + 1, this.timers.length - 1);
                    break;
                case 'KeyK':
                    this.position = Math.max(this.position - 1, 0);
                    break;
                /*case 'KeyN':
                    event.preventDefault();
                    this.$refs.newTimer.focus();
                    break;
                case 'KeyD':
                    this.removeTimer(this.timers[this.position]);
                    break;*/
            }
        }.bind(this));
        setInterval(this.tick, 250);
    },
    methods: {
        tick: function () {
            if (this.activeTimer) {
                var time = this.writeTime(this.getTime() - this.activeTimer.lastStart + this.activeTimer.seconds);
                this.activeTimer.text = time;
                document.title = time + ' ' + this.activeTimer.name;
            } else {
                document.title = 'Time Tracker';
            }
        },
        addTimer: function () {
            var value = this.newTimer && this.newTimer.trim();
            if (!value) {
                return;
            }
            var timer = {name: value, text: '00:00', active: false, seconds: 0, lastStart: null, created: this.getDateString()};
            if (this.activeTimer !== null) {
                this.stopTimer(this.activeTimer);
            }
            this.timers.push(timer);
            this.position = this.timers.length - 1;
            this.runTimer(timer);
            this.newTimer = '';
            this.$refs.newTimer.blur();
        },
        clickTimer: function (timer) {
            if (timer === this.activeTimer) {
                this.stopTimer(timer);
            } else {
                if (this.activeTimer) {
                    this.stopTimer(this.activeTimer);
                }
                this.runTimer(timer);
            }
        },
        runTimer: function (timer) {
            timer.active = true;
            this.activeTimer = timer;
            this.activeTimer.lastStart = this.getTime();
            this.position = this.timers.indexOf(timer);
        },
        stopTimer: function (timer) {
            timer.seconds += this.getTime() - timer.lastStart;
            timer.lastStart = null;
            timer.active = false;
            this.activeTimer = null;
        },
        removeTimer: function (timer) {
            if (timer === this.activeTimer) {
                this.stopTimer(timer);
            }
            this.timers.splice(this.timers.indexOf(timer), 1);
            this.position = Math.min(this.position, this.timers.length - 1);
        },
        editTimer: function (timer) {
            this.beforeEditCache = timer.name;
            this.editedTimer = timer;
        },
        doneEdit: function (timer) {
            if (!this.editedTimer) {
                return;
            }
            this.editedTimer = null;
            timer.name = timer.name.trim();
            if (!timer.name) {
                this.removeTimer(timer);
            }
        },
        cancelEdit: function (timer) {
            this.editedTimer = null;
            timer.name = this.beforeEditCache;
        },
        getTime: function () {
            return Math.floor(Date.now() / 1000);
        },
        writeTime: function (seconds) {
            var t = parseInt(seconds || 0, 10);
            var h = Math.floor(t / 3600);
            var m = Math.floor((t - (h * 3600)) / 60);
            var s = t - (h * 3600) - (m * 60);
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            return h === 0 ? m + ':' + s : h + ':' + m + ':' + s;
        },
        getDateString: function () {
            const now = new Date();
            return this.appendLeadingZero(now.getDate()) + '.' + this.appendLeadingZero(now.getMonth() + 1) + '.' + now.getFullYear();
        },
        appendLeadingZero: function (value) {
            return value < 10 ? '0' + value : value;
        }
    },
    directives: {
        'timer-focus': function (el, value) {
            if (value) {
                el.focus()
            }
        }
    }
});
