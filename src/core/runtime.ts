import {action, computed, IReactionDisposer, makeObservable, observable, reaction, toJS} from 'mobx'
import isEqual from 'lodash.isequal'
import {
    getCurrentTab,
    resolveConfig,
    resolveUrls,
    updateConfig,
    updateExtensionIcon,
    syncCookieBySources
} from "../common";

import type {Config, Target} from "../types";

export class Runtime {
    private static instance: Runtime

    static getInstance() {
        if (!Runtime.instance) {
            Runtime.instance = new Runtime()
        }
        const runtime = Runtime.instance
        runtime.syncCookie(result => result.then(() => {
            const sources = runtime.sources.filter(d => d.activated).map(d => d.host)
            console.log(`sync cookie for ${runtime.host} from ${sources} success`)
        }).catch((e) => {
            const sources = runtime.sources.filter(d => d.activated).map(d => d.host)
            console.log(`sync cookie for ${runtime.host} from ${sources} fail`, e)
        }))
        return runtime
    }

    private depose?: IReactionDisposer

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
    get sources(): Target[] {
        if (!this.host) return []
        const data: Array<Target> = []
        const {rules} = this.config
        for (const [source, targets] of Object.entries(rules)) {
            if (!Array.isArray(targets)) continue
            for (const target of targets) {
                const urls = resolveUrls(target.host)
                if (!urls) continue
                if (urls.includes(this.host)) {
                    data.push({
                        host: source,
                        activated: target.activated
                    })
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
        return !!this.targets.length
    }

    @computed
    get state() {
        if (this.isCookieSource) return 'source'
        if (this.isCookieTarget) return 'target'
        return 'icon'
    }

    @computed
    get isCookieTarget() {
        return !!this.sources.length
    }

    private constructor() {
        this.init()
        makeObservable(this)
        reaction(() => ({
            state: this.state,
            targets: this.targets,
            sources: this.sources
        }), async ({ state, targets, sources }) => {
            let badge: string
            if (state === 'icon') {
                badge = 'OFF'
            } else if (state === 'target') {
                badge = `${sources.filter(d => d.activated).length}/${sources.length}`
            } else {
                badge = `${targets.filter(d => d.activated).length}/${targets.length}`
            }
            await updateExtensionIcon(`${state}`, badge)
        }, { fireImmediately: true })

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
                    return
                }
            } catch (e) {
                // do nothing
            }
            this.updateHost('')
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
        const cfg = JSON.parse(JSON.stringify(config))
        Object.entries(cfg.rules).forEach(([key, value]) => {
            cfg.rules[key] = Array.isArray(value) ? value.map(val => {
                if (typeof val === 'string') {
                    return {
                        host: val,
                        activated: false
                    }
                }
                return val
            }) : []
        })
        this.config = cfg
    }

    @action
    updateRules(rules: Target[]) {
        this.config.rules[this.host] = rules
    }

    @action
    addRule(rule: Target) {
        const config = toJS(this.config)
        config.rules[this.host] = this.config.rules[this.host] || []
        config.rules[this.host].push(rule)
        this.config = config;
    }

    @action
    removeRule(rule: string) {
        const config = toJS(this.config)
        const source = this.isCookieTarget ? rule : this.host
        const target = this.isCookieTarget ? this.host : rule
        config.rules[source] = this.config.rules[source] || []
        config.rules[source] = this.config.rules[source].filter(item => item.host !== target && !resolveUrls(item.host)?.includes(target))
        this.config = config;
    }

    syncCookie(callback: (result: Promise<void>) => void) {
        this.depose?.()
        this.depose = reaction(() => ({
            host: this.host,
            sources: this.sources.filter(d => d.activated).map(d => d.host),
            active: this.isCookieTarget
        }), async ({ sources, host, active }, { sources: oldSources, host: oldHost}) => {
            if (isEqual(sources, oldSources) && host === oldHost) return
            if (!active) return
            callback(syncCookieBySources(this.host, sources))
        })
    }

    @action
    handleActive(rule: string) {
        if (this.isCookieSource) return
        const config = toJS(this.config)
        const source = rule
        const target = this.host
        config.rules[source] = this.config.rules[source] || []
        const ruleItem = this.config.rules[source].find(item => item.host === target || resolveUrls(item.host)?.includes(target))
        if (ruleItem) {
            ruleItem.activated = !ruleItem.activated
        }
        this.config = config
    }
}
