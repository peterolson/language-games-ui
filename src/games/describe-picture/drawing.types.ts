export type Stroke = [number[], number[]];
export type Tool = 'pencil' | 'eraser';
export type StrokeData = {
	id: string;
	stroke: Stroke;
	type: Tool;
};
