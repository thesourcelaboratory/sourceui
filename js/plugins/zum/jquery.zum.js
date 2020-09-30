/*!***************************************************
* zum.js v1.0.1
* Released under the MIT license https://git.io/vwTVl
*****************************************************/

$(function () {

	'use strict';

	var jqZum = function(){

		var Zum = this;

		Zum.hasPositionChanged = ({ pos, prevPos }) => pos !== prevPos;

		Zum.valueInRange = ({ minScale, maxScale, scale }) => scale <= maxScale && scale >= minScale;

		Zum.getTranslate = ({ minScale, maxScale, scale }) => ({ pos, prevPos, translate }) =>
			Zum.valueInRange({ minScale, maxScale, scale }) && Zum.hasPositionChanged({ pos, prevPos })
				? translate + (pos - prevPos * scale) * (1 - 1 / scale)
				: translate;

		Zum.getScale = ({ scale, minScale, maxScale, scaleSensitivity, deltaScale }) => {
			let newScale = scale + (deltaScale / (scaleSensitivity / scale));
			newScale = Math.max(minScale, Math.min(newScale, maxScale));
			return [scale, newScale];
		};

		Zum.getMatrix = ({ scale, translateX, translateY }) => `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;

		Zum.pan = ({ state, originX, originY }) => {
			state.transformation.translateX += originX;
			state.transformation.translateY += originY;
			state.element.style.transform =
				Zum.getMatrix({ scale: state.transformation.scale, translateX: state.transformation.translateX, translateY: state.transformation.translateY });
		};

		Zum.canPan = (state) => ({
			panBy: ({ originX, originY }) => Zum.pan({ state, originX, originY }),
			panTo: ({ originX, originY, scale }) => {
				state.transformation.scale = scale;
				Zum.pan({ state, originX: originX - state.transformation.translateX, originY: originY - state.transformation.translateY });
			},
		});

		Zum.canZoom = (state) => ({
			zoom: ({ x, y, deltaScale }) => {
				const { left, top } = state.element.getBoundingClientRect();
				const { minScale, maxScale, scaleSensitivity } = state;
				const [scale, newScale] = Zum.getScale({ scale: state.transformation.scale, deltaScale, minScale, maxScale, scaleSensitivity });
				const originX = x - left;
				const originY = y - top;
				const newOriginX = originX / scale;
				const newOriginY = originY / scale;
				const translate = Zum.getTranslate({ scale, minScale, maxScale });
				const translateX = translate({ pos: originX, prevPos: state.transformation.originX, translate: state.transformation.translateX });
				const translateY = translate({ pos: originY, prevPos: state.transformation.originY, translate: state.transformation.translateY });

				state.element.style.transformOrigin = `${newOriginX}px ${newOriginY}px`;
				state.element.style.transform = Zum.getMatrix({ scale: newScale, translateX, translateY });
				state.transformation = { originX: newOriginX, originY: newOriginY, translateX, translateY, scale: newScale };
			}
		});

		Zum.renderer = ({ minScale, maxScale, element, scaleSensitivity = 10 }) => {
			const state = {
				element,
				minScale,
				maxScale,
				scaleSensitivity,
				transformation: {
					originX: 0,
					originY: 0,
					translateX: 0,
					translateY: 0,
					scale: 1
				},
			};
			return Object.assign({}, Zum.canZoom(state), Zum.canPan(state));
		};

	};


	$.fn.zum = function(options){
		var $element = $(this);
		$element.each(function(){
			var Zum = new jqZum();
			var Elem = this;
			options = $.extend(true,{ minScale: 0.5, maxScale: 3.0, scaleSensitivity: 10 }, options || {}, {element: Elem});
			const instance = Zum.renderer(options);
			Elem.addEventListener("wheel", (event) => {
				if (!event.ctrlKey) {
					return;
				}
				event.preventDefault();
				instance.zoom({
					deltaScale: Math.sign(event.deltaY) > 0 ? -1 : 1,
					x: event.pageX,
					y: event.pageY
				});
			});
			Elem.addEventListener("dblclick", () => {
				instance.panTo({
					originX: 0,
					originY: 0,
					scale: 1,
				});
			});
			Elem.addEventListener("mousemove", (event) => {
				if (!event.shiftKey) {
					return;
				}
				event.preventDefault();
				instance.panBy({
					originX: event.movementX,
					originY: event.movementY
				});
			})
		});
	};
});