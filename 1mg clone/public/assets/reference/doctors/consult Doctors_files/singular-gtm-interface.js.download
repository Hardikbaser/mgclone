// This the singular GTM interface. v1.1.0

(function singularGtmMain() {
    if (!window.singularSdkQueue) {
        console.log("Singular Data Layer is null");
    } else {
        const queue = window.singularSdkQueue;

        if (!window.singularSdk && !window.isSingularSdkInitializing) {
            initSingularSdkScript(queue);
        } else {
            if (window.isSingularSdkInitializing) {
                waitForInit(queue, 1);
            } else {
                executeCall(queue);
            }
        }
    }

    function waitForInit(queue, retryCounter) {
        if (retryCounter > 100) {
            return;
        }

        setTimeout(function () {
            if (window.isSingularSdkInitializing) {
                retryCounter++;
                waitForInit(queue, retryCounter);
            } else {
                executeCall(queue);
            }
        }, 10);
    }

    function executeCall(queue) {
        if (queue.length === 0) {
            return;
        }

        // The retry mechanism is embedded in the Singular SDK, so there is no need to add it here, thus clearing the queue
        const data = queue.shift();
        window.singularSdkQueue = queue;

        switch (data.trackType) {
            case "init": {
                initSDK(data);
                break;
            }
            case "login": {
                login(data);
                break;
            }
            case "logout": {
                logout();
                break;
            }
            case "conversion": {
                sendConversionEvent(data);
                break;
            }
            case "custom": {
                sendCustomEvent(data);
                break;
            }
            case "revenue": {
                sendRevenueEvent(data);
                break;
            }
            case "pageVisit": {
                sendPageVisit();
                break;
            }
            case "setDeviceCustomUserId": {
                sendDeviceCustomUserId(data);
                break;
            }
            case "getSingularDeviceId": {
                getSingularDeviceId(data);
                break;
            }
            case "getMatchID": {
                getMatchID(data);
                break;
            }
            case "setMatchID": {
                setMatchID(data);
                break;
            }
            case "clearMatchID": {
                clearMatchID();
                break;
            }
            case "getGlobalProperties": {
                getGlobalProperties(data);
                break;
            }
            case "setGlobalProperties": {
                setGlobalProperties(data);
                break;
            }
            case "unsetGlobalProperty": {
                unsetGlobalProperty(data);
                break;
            }
            case "clearGlobalProperties": {
                clearGlobalProperties();
                break;
            }
            case "showBanner": {
                showBanner(data);
                break;
            }
            case "hideBanner": {
                hideBanner();
                break;
            }
            case "openApp": {
                openApp(data);
                break;
            }
            case "buildWebToAppLink": {
                buildWebToAppLink(data);
                break;
            }
            case "enrichUrlWithMarketingData": {
                enrichUrlWithMarketingData(data);
                break;
            }
            default: {
                break;
            }
        }
    }

    function initSDK(data) {
        // Product Id used to be called packageName
        if (data.packageName) {
            data.productId = data.packageName;
        }

        const config = new SingularConfig(data.apikey, data.secret, data.productId).withLogLevel(data.logLevel);

        if (data.customUserId) {
            config.withCustomUserId(data.customUserId);
        }

        if (data.productName) {
            config.withProductName(data.productName);
        }

        if (data.sessionTimeout) {
            config.withSessionTimeoutInMinutes(data.sessionTimeout);
        }

        if (data.subDomainTracking) {
            if (data.subDomainTrackingMode === 'simple') {
                config.withAutoPersistentSingularDeviceId(data.domain);
            } else {
                config.withPersistentSingularDeviceId(data.singularDeviceId);
            }
        }

        if (data.enableEventsDedup) {
            config.withEventsDedupEnabled();
            if (data.timeBetweenEvents) {
                config.withTimeBetweenEvents(data.timeBetweenEvents);
            }
        }

        if (data.globalProperties && data.globalProperties.length) {
            data.globalProperties.forEach(property => config.withGlobalProperty(property.key, property.value, property.overrideExisting));
        }

        if (data.enableBanners) {
            config.withBannersSupport(data.enableWebToApp ? new window.BannersOptions().withWebToAppSupport() : undefined);
        }

        window.singularSdk.init(config);

        if (data.logLevel >= 2) {
            console.log("Singular Web SDK is initialized");
        }
    }

    function login(data) {
        window.singularSdk.login(data.customUserId);
    }

    function logout() {
        window.singularSdk.logout();
    }

    function sendConversionEvent(data) {
        if (data.customUserId) {
            window.singularSdk.login(data.customUserId);
        }

        window.singularSdk.conversionEvent(data.eventName, data.attributes);
    }

    function sendCustomEvent(data) {
        if (data.customUserId) {
            window.singularSdk.login(data.customUserId);
        }

        window.singularSdk.event(data.eventName, data.attributes);
    }

    function sendRevenueEvent(data) {
        if (data.customUserId) {
            window.singularSdk.login(data.customUserId);
        }

        window.singularSdk.revenue(data.eventName, data.currency, data.revenue, data.attributes);
    }

    function sendPageVisit() {
        window.singularSdk.pageVisit();
    }

    function sendDeviceCustomUserId(data) {
        window.singularSdk.setDeviceCustomUserId(data.customUserId);
    }

    function getSingularDeviceId(data) {
        const value = window.singularSdk.getSingularDeviceId();
        if (data && data.dataLayerKey) {
            _pushToDataLayer(data.dataLayerKey, value);
        }
        return value;
    }

    function getMatchID(data) {
        const value = window.singularSdk.getMatchID();
        if (data && data.dataLayerKey) {
            _pushToDataLayer(data.dataLayerKey, value);
        }
        return value;
    }

    function setMatchID(data) {
        window.singularSdk.setMatchID(data.matchId);
    }

    function clearMatchID() {
        window.singularSdk.clearMatchID();
    }

    function getGlobalProperties(data) {
        const value = window.singularSdk.getGlobalProperties();
        if (data && data.dataLayerKey) {
            _pushToDataLayer(data.dataLayerKey, value);
        }
        return value;
    }

    function setGlobalProperties(data) {
        window.singularSdk.setGlobalProperties(data.key, data.value, data.overrideExisting);
    }

    function unsetGlobalProperty(data) {
        window.singularSdk.unsetGlobalProperty(data.key);
    }

    function clearGlobalProperties() {
        return window.singularSdk.clearGlobalProperties();
    }

    function buildLinkParams(data) {
        const linkParams = new window.LinkParams();

        return linkParams
            .withAndroidRedirect(data.androidRedirect)
            .withAndroidDL(data.androidDeeplink)
            .withAndroidDDL(data.androidDeferredDeeplink)
            .withIosRedirect(data.iosRedirect)
            .withIosDL(data.iosDeeplink)
            .withIosDDL(data.iosDeferredDeeplink);
    }

    function showBanner(data) {
        window.singularSdk.showBanner(buildLinkParams(data));
    }

    function hideBanner() {
        window.singularSdk.hideBanner();
    }

    function openApp(data) {
        window.singularSdk.openApp(
            data.baseLink,
            data.androidDeeplink || data.iosDeeplink || null,
            null,
            data.androidDeferredDeeplink || data.iosDeferredDeeplink || null
        );
    }

    function buildWebToAppLink(data) {
        const value = window.singularSdk.buildWebToAppLink(
            data.baseLink,
            data.androidDeeplink || data.iosDeeplink || null,
            null,
            data.androidDeferredDeeplink || data.iosDeferredDeeplink || null
        );
        if (data && data.dataLayerKey) {
            _pushToDataLayer(data.dataLayerKey, value);
        }
        return value;
    }

    function enrichUrlWithMarketingData(data) {
        return window.singularSdk.enrichUrlWithMarketingData(data.urlToEnrich);
    }

    function initSingularSdkScript(queue) {
        window.isSingularSdkInitializing = true;
        loadScript('https://web-sdk-cdn.singular.net/singular-sdk/latest/singular-sdk.js', function () {
            if (!window.singularSdk) {
                console.log("Unable to load Singular's Web SDK");
                window.isSingularSdkInitializing = false;
            } else {
                executeCall(queue);
                window.isSingularSdkInitializing = false;
            }
        });
    }

    function loadScript(url, callback) {
        const head = document.head;
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    }

    function _pushToDataLayer(key, value) {
        if (!key) return;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: `singular.dataLayer.${key}.updated`,
            dlKey: key,
            [key]: value
        });
    }
})();
