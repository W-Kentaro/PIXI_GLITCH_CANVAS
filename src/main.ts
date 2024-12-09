import {Application, Assets, Sprite} from "pixi.js"
import {GlitchFilter} from "pixi-filters"

export class GlitchImage {
  private devicePixelRatio: number = this.useragent.ua === 'pc' ? 1 : window.devicePixelRatio || 1;
  private el: HTMLElement;
  private app: any;
  private rect: DOMRect | undefined;
  private glitchFilter: any;
  private img: Sprite | undefined;
  private fpsRatio: number = 1;
  public glitchOption: any;
  public callBack: any;
  public option: any;
  private count: number = 0;
  public animation: (count: number, glitch: any) => void;

  constructor(target: HTMLElement | string, option: any = {glitch: {}, on: {}}) {
    this.option = {
      init: true,
      autoStart: true,
      useWebGPU: true,
      backgroundAlpha: 0,
      canvasScale: 1.2,
    }
    this.glitchOption = {
      init: true,
      slices: 5,
      offset: 100,
      red: [0, 0],
      blue: [0, 0],
      green: [0, 0],
    }
    this.callBack = {
      init(): void {
      },
    }
    this.animation = (count, glitch) => {
      if (count % 8 === 0) {
        glitch.refresh();
        if (Math.random() > .8) {
          const _ran = Math.random() * (30 - 1);
          const _ran2 = Math.random() * (30 - 1);
          glitch.red = [15 - _ran, 15 - _ran2];
          if (count % 20 === 0) {
            const _ran3 = Math.random();
            if (_ran3 > .8) {
              glitch.slices = 2;
            } else {
              glitch.slices = 0;
            }
          } else {
            glitch.slices = 0;
          }
        } else {
          glitch.red = [0, 0];
        }
      }
    }
    this.el = typeof target === "string" ? document.querySelector<HTMLElement>(target)! : target;
    this.option = Object.assign(this.option, option);
    this.glitchOption = Object.assign(this.glitchOption, option?.glitch);
    this.callBack = Object.assign(this.callBack, option?.on);

    this.animation = this.option?.animation ? this.option?.animation : this.animation;

    if (this.option.init) {
      this.init();
    }
  }

  async setup() {
    this.rect = this.el.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    this.app = new Application();

    await this.app.init({
      width: this.rect ? this.rect.width * this.devicePixelRatio * this.option.canvasScale : window.innerWidth,
      height: this.rect ? this.rect.height * this.devicePixelRatio * this.option.canvasScale : window.innerHeight,
      backgroundAlpha: this.option.backgroundAlpha,
      autoStart: this.option.autoStart,
      preference: this.option.useWebGPU ? canvas.getContext('webgpu') ? 'webgpu' : 'webgl' : 'webgl',
      resolution: 1,
    });
    this.el.appendChild(this.app.canvas);

    this.setAreaSize()
    const $img = this.el?.querySelector('img')!;
    const imgSource = $img?.getAttribute('src')!;
    await this.setImage(imgSource)
    $img.style.opacity = "0";

    window.addEventListener('resize', () => {
      this.setAreaSize();
      this.setImageSize();
    });

    this.app.ticker.maxFPS = 59.99;
    this.fpsRatio = this.useragent.ua === "pc" ? Math.ceil(this.app.ticker.FPS / 60) : Math.ceil(this.app.ticker.FPS / 30);

    this.app.ticker.add(() => {
      this.count++;
      if (this.count % this.fpsRatio === 0 && this.glitchFilter.enabled) {
        this.animation(this.count, this.glitchFilter)
      }
    });
  }

  private async setImage(source: string) {
    this.img = new Sprite(await Assets.load(source));
    this.img?.anchor.set(.5);
    this.app.stage.addChild(this.img);

    // @ts-ignore
    this.glitchFilter = new GlitchFilter();
    // glitchLogo
    this.glitchFilter.enabled = this.glitchOption.init;
    this.glitchFilter.slices = this.glitchOption.slices;
    this.glitchFilter.offset = this.glitchOption.offset;

    this.img.filters = [this.glitchFilter];
    this.setImageSize();
  };

  public setAreaSize() {
    this.rect = this.el?.getBoundingClientRect();
    if (this.app && this.app.stage) {
      this.app.width = this.rect.width * this.devicePixelRatio * this.option.canvasScale;
      this.app.height = this.rect.height * this.devicePixelRatio * this.option.canvasScale;

      this.app.renderer.resize(this.rect.width * this.devicePixelRatio * this.option.canvasScale, this.rect.height * this.devicePixelRatio * this.option.canvasScale);

      this.app.canvas.style.width = `${this.rect.width * this.option.canvasScale}px`;
      this.app.canvas.style.height = `${this.rect.height * this.option.canvasScale}px`;
    }
  };

  public setImageSize() {
    if (this.img) {
      const imgRect = this.el.getBoundingClientRect();
      this.img.width = imgRect.width * devicePixelRatio;
      this.img.height = imgRect.height * devicePixelRatio;
      this.img.x = imgRect.width * this.option.canvasScale * devicePixelRatio * .5;
      this.img.y = imgRect.height * this.option.canvasScale * devicePixelRatio * .5;
    }
  };

  public start() {
    this.app.start();
  }

  public stop() {
    this.app.stop();
  }

  public init() {
    this.setup()
      .then(() => {
        this.option.on.init(this.app);
      });
  }

  private get useragent(): any {
    const _ua: any = {};
    const ua: string = navigator?.userAgent?.toLowerCase();
    if (ua.indexOf('iphone') > 0 || ua.indexOf('android') > 0 && ua.indexOf('mobile') > 0) {
      _ua.ua = 'sp';
      if (ua.indexOf('iphone') > 0) {
        _ua.os = 'iOS';
      }
      if (ua.indexOf('android') > 0) {
        _ua.os = 'android';
      }
    } else if (ua.indexOf('ipad') > 0 || ua.indexOf('android') > 0) {
      _ua.ua = 'sp';
      if (ua.indexOf('ipad') > 0) {
        _ua.os = 'iOS';
      }
      if (ua.indexOf('android') > 0) {
        _ua.os = 'android';
      }
    } else {
      _ua.ua = 'pc';
      _ua.os = 'pc';
    }
    if (ua.indexOf('windows nt') !== -1) {
      _ua.os = 'win';
    } else if (_ua.ua === 'pc' && ua.indexOf('mac os x') !== -1) {
      _ua.os = 'mac';
    }
    if (ua.indexOf('msie') !== -1 || ua.indexOf('trident') !== -1) {
      _ua.browser = 'ie';
    } else if (ua.indexOf('edge') !== -1) {
      _ua.browser = 'html_edge';
    } else if (ua.indexOf('edg') !== -1) {
      _ua.browser = 'edge';
    } else if (ua.indexOf('chrome') !== -1) {
      _ua.browser = 'chrome';
    } else if (ua.indexOf('safari') !== -1) {
      _ua.browser = 'safari';
    } else if (ua.indexOf('firefox') !== -1) {
      _ua.browser = 'firefox';
    } else {
      _ua.browser = 'other';
    }
    return _ua;
  }
}

window.GlitchImage = GlitchImage;