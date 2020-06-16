let source = JSON.parse(data);
let source2 = JSON.parse(data2);

var animation = bodymovin.loadAnimation({
    container: document.getElementById('element'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: source
});

animation.setSubframe(false);

var animation2 = bodymovin.loadAnimation({
    container: document.getElementById('element2'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: source2
});

animation.setSubframe(false);