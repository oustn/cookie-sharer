import {action, computed, makeObservable, observable, reaction, toJS} from 'mobx'
import {getCurrentTab, resolveConfig, resolveUrls, updateConfig, updateExtensionIcon} from "../common/helper";
import {Config} from "../env";
import {syncCookieBySources} from "../common/sync-cookie";

export class Runtime {
    @observable
    public host: string = ""

    @observable
    public config: Config = {
        rules: {}
    }

    /**
     * @description 当前页面的 cookie 来源
     */
    @computed
    get sources(): string[] {
        if (!this.host) return []
        const data = []
        const {rules} = this.config
        for (const [source, targets] of Object.entries(rules)) {
            if (!Array.isArray(targets)) continue
            for (const target of targets) {
                const urls = resolveUrls(target)
                if (!urls) continue
                if (urls.includes(this.host)) {
                    data.push(source)
                }
            }
        }
        return data
    }

    @computed
    get targets() {
        if (!this.host) return []
        return this.config.rules[this.host] || []
    }

    @computed
    get isCookieSource() {
        return this.targets.length
    }

    @computed
    get state() {
        if (this.isCookieSource) return 'source'
        if (this.isCookieTarget) return 'target'
        return 'base'
    }

    @computed
    get isCookieTarget() {
        return this.sources.length
    }

    constructor() {
        this.init()
        makeObservable(this)
        reaction(() => this.state, async state => {
            await updateExtensionIcon(`cookie-${state}`)
        })

        reaction(() => this.config, async () => {
            await updateConfig(toJS(this.config))
        })
    }

    init() {
        getCurrentTab().then(tab => {
            if (!tab) return

            try {
                const url = new URL(tab.url || '')
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    this.updateHost(url.origin)
                }
            } catch (e) {
                // do nothing
            }
        })

        resolveConfig().then(config => {
            this.updateConfig(config)
        })
    }

    @action
    private updateHost(host: string) {
        this.host = host
    }

    @action
    private updateConfig(config: Config) {
        this.config = JSON.parse(JSON.stringify(config))
    }

    @action
    updateRules(rules: string[]) {
        this.config.rules[this.host] = rules
    }

    @action
    addRule(rule: string) {
        const config = toJS(this.config)
        config.rules[this.host] = this.config.rules[this.host] || []
        config.rules[this.host].push(rule)
        this.config = config;
    }

    @action
    removeRule(rule: string) {
        const config = toJS(this.config)
        config.rules[this.host] = this.config.rules[this.host] || []
        config.rules[this.host] = this.config.rules[this.host].filter(item => item !== rule)
        this.config = config;
    }

    syncCookie(callback: (result: Promise<void>) => void) {
        reaction(() => ({
            host: this.host,
            sources: this.sources,
        }), async () => {
            if (this.sources.length) {
                callback(syncCookieBySources(this.host, this.sources))
            }
        })
    }
}
