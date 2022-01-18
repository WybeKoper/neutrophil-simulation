class Circle {
    constructor(x, y, radius, color) {
        this.x_pos = x;
        this.y_pos = y;
        this.radius = radius;
        this.dx = Math.random()*2 - 1;
        this.dy = Math.random()*2 - 1;
        this.health = 50;
        this.ttl = 2000 + Math.random() * 1000;
        this.color = color
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.arc(this.x_pos, this.y_pos, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    age() {
        this.ttl -= 1;
    }

    move() {
        this.x_pos += this.dx;
        this.y_pos += this.dy;
    }

    velocityNoise() {
        this.dx += Math.random()*1 - 0.5;
        this.dy += Math.random()*1 - 0.5;
    }


    velocityChange() {
        if (Math.random() > 0.999){
            this.dy *= -1;
        }
        if (Math.random() > 0.999){
            this.dx *= -1;
        }
        this.velocityNoise();
        this.capVelocity(1.5);
    }

    split() {
        return new Circle(this.x_pos, this.y_pos, this.radius, this.color);
    }

    capVelocity(velocity_threshold) {
        if (this.dx > velocity_threshold) {
            this.dx = velocity_threshold
        } else if (this.dx < -velocity_threshold) {
            this.dx = -velocity_threshold;
        }
        if (this.dy > velocity_threshold) {
            this.dy = velocity_threshold
        } else if (this.dy < -velocity_threshold) {
            this.dy = -velocity_threshold;
        }
    }

    decayVelocity(velocity_decay_rate){
        if (this.dx > 0) {
            this.dx -= velocity_decay_rate;
        } else if (this.dx < 0) {
            this.dx += velocity_decay_rate;
        }
        if (this.dy > 0) {
            this.dy -= velocity_decay_rate;
        } else if (this.dy < 0) {
            this.dy += velocity_decay_rate;
        }
        if (Math.abs(this.dx) < velocity_decay_rate) {
            this.dx = 0;
        }
        if (Math.abs(this.dy) < velocity_decay_rate) {
            this.dy = 0
        }
    }

    detectParticlesInsideRadius(particles){
        let encountered = false;
        let x_avg = 0;
        let y_avg = 0;
        let count = 0;
        for (var i = 0; i < particles.length; i++) {
            if (particles[i].x_pos < (this.x_pos + this.radius) && particles[i].x_pos > (this.x_pos - this.radius) && particles[i].y_pos < (this.y_pos + this.radius) && particles[i].y_pos > (this.y_pos - this.radius)) {
                particles[i].alive = false;
                encountered = true;
                x_avg += particles[i].x_pos;
                y_avg += particles[i].y_pos;
                count += 1;
            }
        }
        return [encountered, x_avg, y_avg, count];
    }

    calculateVelocityBasedOnParticles(averageParticlesInCircle){
        let x_avg = averageParticlesInCircle[1] / averageParticlesInCircle[3];
        let y_avg = averageParticlesInCircle[2] / averageParticlesInCircle[3];
        let angle = Math.atan(Math.abs(x_avg - this.x_pos) / Math.abs(y_avg - this.y_pos))
        if (x_avg < this.x_pos) {
            this.dx += -2 * Math.cos(angle);

        } else {
            this.dx += 2 * Math.cos(angle);
        }
        if (y_avg < this.y_pos) {
            this.dy += -2 * Math.sin(angle);

        } else {
            this.dy += 2 * Math.sin(angle);

        }
    }

    gradientBasedVelocity(particles) {
        let averageParticlesInCircle = this.detectParticlesInsideRadius(particles);

        if (averageParticlesInCircle[0]) {
            this.calculateVelocityBasedOnParticles(averageParticlesInCircle);
        }
        else {
            this.velocityNoise();
        }

        this.capVelocity(2);
        this.decayVelocity(0.1);
        return particles;


    }

    generateParticle(color) {
        return new Particle(this.x_pos, this.y_pos, color);
    }

    bounds(height, width) {
        if (this.x_pos < 0 + this.radius) {
            this.x_pos = this.radius;
            this.dx *= -1;
        }
        if (this.y_pos < 0 + this.radius) {
            this.y_pos = this.radius;
            this.dy *= -1;
        }
        if (this.x_pos > width - this.radius) {
            this.x_pos = width - this.radius;
            this.dx *= -1;
        }
        if (this.y_pos > height - this.radius) {
            this.y_pos = height - this.radius;
            this.dy *= -1;
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x_pos = x;
        this.y_pos = y;
        this.ttl = 500;
        this.alive = true;
        this.color = color
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.rect(this.x_pos, this.y_pos, 1, 1);
        ctx.stroke();
    }

    move() {
        this.x_pos += Math.round(Math.random() * 20 - 10);
        this.y_pos += Math.round(Math.random() * 20 - 10);
    }

    age() {
        this.ttl -= 1;
        if (this.ttl == 0) {
            this.alive = false;
        }
    }

    bounds(height, width) {
        if (this.x_pos < 0) {
            this.x_pos = 0;
        }
        if (this.y_pos < 0) {
            this.y_pos = 0;
        }
        if (this.x_pos > width) {
            this.x_pos = width;
        }
        if (this.y_pos > height) {
            this.y_pos = height;
        }
    }
}


; (function () {


    function init() {

        canvas = document.getElementById('canvasId');
        ctx = canvas.getContext('2d');
        canvas.style.position = "absolute"; 
        canvas.style.left = "0px";     
        canvas.style.top = "0px";
        canvas.width = innerWidth;         
        canvas.height = innerHeight;

        splitting_threshold = 0.99;
        particle_generation_threshold = 0.3;

        max_small_bacteria = 15;
        max_medium_bacteria = 6;
        max_large_bacteria = 2;

        small_bacteria_radius = 5;
        medium_bacteria_radius = 20;
        large_bacteria_radius = 40;

        small_bacteria_color = '#99ff66'
        medium_bacteria_color = 'pink'
        large_bacteria_color = '#00ffff'

        small_bacteria = []
        medium_bacteria = []
        large_bacteria = []

        small_bacteria_particles = [];
        medium_bacteria_particles = [];
        

        // Initialize bacteria
        for (var i = 0; i < max_small_bacteria; i++) {
            small_bacteria.push(new Circle(Math.random() * canvas.width, Math.random() * canvas.height, small_bacteria_radius, small_bacteria_color))
        }
        for (var i = 0; i < max_medium_bacteria; i++) {
            medium_bacteria.push(new Circle(Math.random() * canvas.width, Math.random() * canvas.height, medium_bacteria_radius, medium_bacteria_color))
        }
        for (var i = 0; i < max_large_bacteria; i++) {
            large_bacteria.push(new Circle(Math.random() * canvas.width, Math.random() * canvas.height, large_bacteria_radius, large_bacteria_color))
        }


        // begin update loop
        window.requestAnimationFrame(update);
    }

    // draws stuff to the screen
    // allows us to separate calculations and drawing
    function draw() {

        // clear the canvas and redraw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();

        // draw particles
        for (var i = 0; i < small_bacteria_particles.length; i++) {
            small_bacteria_particles[i].draw(ctx);
        }

        for (var i = 0; i < medium_bacteria_particles.length; i++) {
            medium_bacteria_particles[i].draw(ctx);
        }

        // draw bacteria
        for (var i = 0; i < large_bacteria.length; i++) {
            large_bacteria[i].draw(ctx);
        }

        for (var i = 0; i < medium_bacteria.length; i++) {
            medium_bacteria[i].draw(ctx);
        }

        for (var i = 0; i < small_bacteria.length; i++) {
            small_bacteria[i].draw(ctx);
        }

    }


    function update() {
        // queue the next update
        window.requestAnimationFrame(update);

        // logic 

        // large bacteria logic
        surviving_large_bacteria = []
        for (var i = 0; i < large_bacteria.length; i++) {
            small_bacteria_particles = large_bacteria[i].gradientBasedVelocity(small_bacteria_particles);
            large_bacteria[i].bounds(canvas.height, canvas.width);
            large_bacteria[i].age();
            large_bacteria[i].move();
            if (large_bacteria[i].ttl > 0) {
                surviving_large_bacteria.push(large_bacteria[i])
            }
            if (Math.random() > splitting_threshold && large_bacteria.length < max_large_bacteria) {
                surviving_large_bacteria.push(large_bacteria[i].split())
            }
        }
        if (surviving_large_bacteria.length == 0) {
            surviving_large_bacteria.push(new Circle(Math.random() * canvas.width, Math.random() * canvas.height, large_bacteria_radius, large_bacteria_color))
        }
        large_bacteria = surviving_large_bacteria

        // medium bacteria logic
        surviving_medium_bacteria = []
        for (var i = 0; i < medium_bacteria.length; i++) {
            medium_bacteria_particles = medium_bacteria[i].gradientBasedVelocity(medium_bacteria_particles);
            medium_bacteria[i].bounds(canvas.height, canvas.width);
            medium_bacteria[i].age();
            medium_bacteria[i].move();

            for (var j = 0; j < large_bacteria.length; j++) {

                if (large_bacteria[j].x_pos - large_bacteria[j].radius < medium_bacteria[i].x_pos && medium_bacteria[i].x_pos < large_bacteria[j].x_pos + large_bacteria[j].radius && large_bacteria[j].y_pos - large_bacteria[j].radius < medium_bacteria[i].y_pos && medium_bacteria[i].y_pos < large_bacteria[j].y_pos + large_bacteria[j].radius) {
                    medium_bacteria[i].health -= 1;
                }
            }

            if (Math.random() > particle_generation_threshold) {
                small_bacteria_particles.push(medium_bacteria[i].generateParticle('red'));
            }
            if (medium_bacteria[i].health > 0 && medium_bacteria[i].ttl > 0) {
                surviving_medium_bacteria.push(medium_bacteria[i])
            }

            if (Math.random() > splitting_threshold && medium_bacteria.length < max_medium_bacteria) {
                surviving_medium_bacteria.push(medium_bacteria[i].split())
            }
        }
        if (surviving_medium_bacteria.length == 0) {
            surviving_medium_bacteria.push(new Circle(Math.random() * canvas.width, Math.random() * canvas.height, medium_bacteria_radius, medium_bacteria_color))
        }
        medium_bacteria = surviving_medium_bacteria;


        // small bacteria logic
        surviving_small_bacteria = []
        for (var i = 0; i < small_bacteria.length; i++) {
            small_bacteria[i].velocityChange();
            small_bacteria[i].move();
            small_bacteria[i].bounds(canvas.height, canvas.width);
            small_bacteria[i].age();
            for (var j = 0; j < medium_bacteria.length; j++) {

                if (medium_bacteria[j].x_pos - medium_bacteria[j].radius < small_bacteria[i].x_pos && small_bacteria[i].x_pos < medium_bacteria[j].x_pos + medium_bacteria[j].radius && medium_bacteria[j].y_pos - medium_bacteria[j].radius < small_bacteria[i].y_pos && small_bacteria[i].y_pos < medium_bacteria[j].y_pos + medium_bacteria[j].radius) {
                    small_bacteria[i].health -= 1;
                }
            }
            if (Math.random() > particle_generation_threshold) {
                medium_bacteria_particles.push(small_bacteria[i].generateParticle('#66ff33'));
            }

            if (small_bacteria[i].health > 0 && small_bacteria[i].ttl > 0) {
                surviving_small_bacteria.push(small_bacteria[i])
            }
            if (Math.random() > splitting_threshold && small_bacteria.length < max_small_bacteria) {
                surviving_small_bacteria.push(small_bacteria[i].split())
            }
        }
        if (surviving_small_bacteria.length == 0) {
            surviving_small_bacteria.push(new Circle(Math.random() * canvas.width, Math.random() * canvas.height, small_bacteria_radius, small_bacteria_color))
        }
        small_bacteria = surviving_small_bacteria


        // remove old particles for small bacteria
        var surviving_small_bacteria_particles = [];
        for (var i = 0; i < small_bacteria_particles.length; i++) {
            small_bacteria_particles[i].move();
            small_bacteria_particles[i].bounds(canvas.height, canvas.width);
            small_bacteria_particles[i].age();
            if (small_bacteria_particles[i].alive) {
                surviving_small_bacteria_particles.push(small_bacteria_particles[i]);
            }
        }
        small_bacteria_particles = surviving_small_bacteria_particles;


        // remove old particles for medium bacteria
        var surviving_medium_bacteria_particles = [];
        for (var i = 0; i < medium_bacteria_particles.length; i++) {
            medium_bacteria_particles[i].move();
            medium_bacteria_particles[i].bounds(canvas.height, canvas.width);
            medium_bacteria_particles[i].age();
            if (medium_bacteria_particles[i].alive) {
                surviving_medium_bacteria_particles.push(medium_bacteria_particles[i]);
            }
        }
        medium_bacteria_particles = surviving_medium_bacteria_particles;

        // draw after logic/calculations
        draw();
    }

    // start our code once the page has loaded
    document.addEventListener('DOMContentLoaded', init);
})()