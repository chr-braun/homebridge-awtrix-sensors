/**
 * Sensor Rule Engine
 * Converts MQTT sensor values into automation rules
 */

import { EventEmitter } from 'events';

export interface SensorRule {
  id: string;
  name: string;
  description: string;
  sensorTopic: string;
  sensorName: string;
  sensorType: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  priority: number;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface RuleCondition {
  id: string;
  type: 'value' | 'range' | 'change' | 'time' | 'pattern';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
  threshold?: number;
  timeRange?: { start: string; end: string };
  pattern?: string;
}

export interface RuleAction {
  id: string;
  type: 'awtrix_display' | 'awtrix_notification' | 'awtrix_effect' | 'mqtt_publish' | 'homekit_update';
  target: string;
  message: string;
  color?: string;
  icon?: number;
  effect?: string;
  duration?: number;
  slot?: number;
  priority?: number;
}

export interface SensorValue {
  topic: string;
  name: string;
  type: string;
  value: any;
  unit?: string;
  timestamp: Date;
  quality: number;
}

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sensorTypes: string[];
  template: {
    conditions: Partial<RuleCondition>[];
    actions: Partial<RuleAction>[];
  };
}

export class SensorRuleEngine extends EventEmitter {
  private rules: Map<string, SensorRule> = new Map();
  private sensorValues: Map<string, SensorValue> = new Map();
  private ruleTemplates: Map<string, RuleTemplate> = new Map();
  private isRunning = false;
  private evaluationInterval: NodeJS.Timeout | null = null;

  constructor(private log: any) {
    super();
    this.initializeRuleTemplates();
  }

  // Rule Management
  createRule(ruleData: Partial<SensorRule>): SensorRule {
    const rule: SensorRule = {
      id: ruleData.id || `rule_${Date.now()}`,
      name: ruleData.name || 'Neue Regel',
      description: ruleData.description || '',
      sensorTopic: ruleData.sensorTopic || '',
      sensorName: ruleData.sensorName || '',
      sensorType: ruleData.sensorType || '',
      conditions: ruleData.conditions || [],
      actions: ruleData.actions || [],
      enabled: ruleData.enabled !== false,
      priority: ruleData.priority || 1,
      triggerCount: 0
    };

    this.rules.set(rule.id, rule);
    this.log.info(`Rule created: ${rule.name} (${rule.id})`);
    this.emit('ruleCreated', rule);
    
    return rule;
  }

  updateRule(ruleId: string, updates: Partial<SensorRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    this.rules.set(ruleId, rule);
    this.log.info(`Rule updated: ${rule.name} (${ruleId})`);
    this.emit('ruleUpdated', rule);
    
    return true;
  }

  deleteRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    this.rules.delete(ruleId);
    this.log.info(`Rule deleted: ${rule.name} (${ruleId})`);
    this.emit('ruleDeleted', ruleId);
    
    return true;
  }

  getRule(ruleId: string): SensorRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): SensorRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  // Sensor Value Management
  updateSensorValue(sensorValue: SensorValue): void {
    this.sensorValues.set(sensorValue.topic, sensorValue);
    this.log.debug(`Sensor value updated: ${sensorValue.name} = ${sensorValue.value}`);
    this.emit('sensorValueUpdated', sensorValue);
  }

  getSensorValue(topic: string): SensorValue | undefined {
    return this.sensorValues.get(topic);
  }

  getAllSensorValues(): SensorValue[] {
    return Array.from(this.sensorValues.values());
  }

  // Rule Evaluation
  startEvaluation(intervalMs: number = 1000): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.evaluationInterval = setInterval(() => {
      this.evaluateAllRules();
    }, intervalMs);

    this.log.info('Rule engine started');
    this.emit('engineStarted');
  }

  stopEvaluation(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }

    this.log.info('Rule engine stopped');
    this.emit('engineStopped');
  }

  private evaluateAllRules(): void {
    const enabledRules = this.getAllRules().filter(rule => rule.enabled);
    
    for (const rule of enabledRules) {
      try {
        if (this.evaluateRule(rule)) {
          this.executeRuleActions(rule);
        }
      } catch (error) {
        this.log.error(`Error evaluating rule ${rule.name}:`, error);
      }
    }
  }

  private evaluateRule(rule: SensorRule): boolean {
    const sensorValue = this.getSensorValue(rule.sensorTopic);
    if (!sensorValue) return false;

    // Check all conditions
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, sensorValue)) {
        return false;
      }
    }

    return true;
  }

  private evaluateCondition(condition: RuleCondition, sensorValue: SensorValue): boolean {
    const value = sensorValue.value;
    const conditionValue = condition.value;

    switch (condition.type) {
      case 'value':
        return this.evaluateValueCondition(value, condition.operator, conditionValue);
      
      case 'range':
        return this.evaluateRangeCondition(value, condition.operator, conditionValue, condition.threshold);
      
      case 'change':
        return this.evaluateChangeCondition(sensorValue, condition.operator, conditionValue);
      
      case 'time':
        return this.evaluateTimeCondition(condition.timeRange);
      
      case 'pattern':
        return this.evaluatePatternCondition(value, condition.pattern, condition.operator);
      
      default:
        return false;
    }
  }

  private evaluateValueCondition(value: any, operator: string, conditionValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value == conditionValue;
      case 'not_equals':
        return value != conditionValue;
      case 'greater_than':
        return Number(value) > Number(conditionValue);
      case 'less_than':
        return Number(value) < Number(conditionValue);
      case 'contains':
        return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'regex':
        return new RegExp(conditionValue).test(String(value));
      default:
        return false;
    }
  }

  private evaluateRangeCondition(value: any, operator: string, minValue: any, maxValue?: number): boolean {
    const numValue = Number(value);
    const numMin = Number(minValue);
    const numMax = maxValue ? Number(maxValue) : undefined;

    switch (operator) {
      case 'greater_than':
        return numValue > numMin;
      case 'less_than':
        return numValue < numMin;
      case 'equals':
        return numValue >= numMin && (numMax === undefined || numValue <= numMax);
      default:
        return false;
    }
  }

  private evaluateChangeCondition(_sensorValue: SensorValue, _operator: string, _threshold: any): boolean {
    // This would need to track previous values
    // For now, return false as this requires state management
    return false;
  }

  private evaluateTimeCondition(timeRange?: { start: string; end: string }): boolean {
    if (!timeRange) return true;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = this.parseTime(timeRange.start);
    const endTime = this.parseTime(timeRange.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight range
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private evaluatePatternCondition(value: any, pattern?: string, operator: string = 'regex'): boolean {
    if (!pattern) return false;
    return this.evaluateValueCondition(value, operator, pattern);
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 100 + (minutes || 0);
  }

  private executeRuleActions(rule: SensorRule): void {
    rule.lastTriggered = new Date();
    rule.triggerCount++;

    this.log.info(`Rule triggered: ${rule.name} (${rule.triggerCount} times)`);
    this.emit('ruleTriggered', rule);

    for (const action of rule.actions) {
      try {
        this.executeAction(action, rule);
      } catch (error) {
        this.log.error(`Error executing action ${action.id}:`, error);
      }
    }
  }

  private executeAction(action: RuleAction, _rule: SensorRule): void {
    switch (action.type) {
      case 'awtrix_display':
        this.executeAwtrixDisplayAction(action, _rule);
        break;
      case 'awtrix_notification':
        this.executeAwtrixNotificationAction(action, _rule);
        break;
      case 'awtrix_effect':
        this.executeAwtrixEffectAction(action, _rule);
        break;
      case 'mqtt_publish':
        this.executeMqttPublishAction(action, _rule);
        break;
      case 'homekit_update':
        this.executeHomekitUpdateAction(action, _rule);
        break;
    }

    this.emit('actionExecuted', action, _rule);
  }

  private executeAwtrixDisplayAction(action: RuleAction, rule: SensorRule): void {
    const sensorValue = this.getSensorValue(rule.sensorTopic);
    if (!sensorValue) return;

    const message = this.interpolateMessage(action.message, sensorValue, rule);
    
    this.emit('awtrixDisplay', {
      message,
      color: action.color || '#FFFFFF',
      icon: action.icon || 0,
      slot: action.slot || 1,
      duration: action.duration || 5000,
      priority: action.priority || 1
    });
  }

  private executeAwtrixNotificationAction(action: RuleAction, rule: SensorRule): void {
    const sensorValue = this.getSensorValue(rule.sensorTopic);
    if (!sensorValue) return;

    const message = this.interpolateMessage(action.message, sensorValue, rule);
    
    this.emit('awtrixNotification', {
      message,
      color: action.color || '#FF0000',
      icon: action.icon || 0,
      duration: action.duration || 10000,
      priority: action.priority || 10
    });
  }

  private executeAwtrixEffectAction(action: RuleAction, _rule: SensorRule): void {
    this.emit('awtrixEffect', {
      effect: action.effect || 'none',
      color: action.color || '#FFFFFF',
      duration: action.duration || 5000
    });
  }

  private executeMqttPublishAction(action: RuleAction, rule: SensorRule): void {
    const sensorValue = this.getSensorValue(rule.sensorTopic);
    if (!sensorValue) return;

    const message = this.interpolateMessage(action.message, sensorValue, rule);
    
    this.emit('mqttPublish', {
      topic: action.target,
      message
    });
  }

  private executeHomekitUpdateAction(action: RuleAction, rule: SensorRule): void {
    const sensorValue = this.getSensorValue(rule.sensorTopic);
    if (!sensorValue) return;

    this.emit('homekitUpdate', {
      accessory: action.target,
      value: sensorValue.value,
      unit: sensorValue.unit
    });
  }

  private interpolateMessage(message: string, sensorValue: SensorValue, rule: SensorRule): string {
    return message
      .replace(/\{sensor_name\}/g, sensorValue.name)
      .replace(/\{sensor_value\}/g, String(sensorValue.value))
      .replace(/\{sensor_unit\}/g, sensorValue.unit || '')
      .replace(/\{sensor_type\}/g, sensorValue.type)
      .replace(/\{rule_name\}/g, rule.name)
      .replace(/\{timestamp\}/g, sensorValue.timestamp.toLocaleString('de-DE'))
      .replace(/\{trigger_count\}/g, String(rule.triggerCount));
  }

  // Rule Templates
  private initializeRuleTemplates(): void {
    const templates: RuleTemplate[] = [
      {
        id: 'temperature_high',
        name: 'Temperatur zu hoch',
        description: 'Warnt bei hoher Temperatur',
        category: 'Temperature',
        sensorTypes: ['temperature'],
        template: {
          conditions: [
            { type: 'value', operator: 'greater_than', value: 25 }
          ],
          actions: [
            { type: 'awtrix_notification', message: '⚠️ Temperatur: {sensor_value}°C', color: '#FF0000', icon: 1 }
          ]
        }
      },
      {
        id: 'humidity_low',
        name: 'Luftfeuchtigkeit zu niedrig',
        description: 'Warnt bei niedriger Luftfeuchtigkeit',
        category: 'Humidity',
        sensorTypes: ['humidity'],
        template: {
          conditions: [
            { type: 'value', operator: 'less_than', value: 30 }
          ],
          actions: [
            { type: 'awtrix_display', message: '💧 Luftfeuchtigkeit: {sensor_value}%', color: '#00BFFF', icon: 2 }
          ]
        }
      },
      {
        id: 'motion_detected',
        name: 'Bewegung erkannt',
        description: 'Zeigt Bewegungserkennung an',
        category: 'Motion',
        sensorTypes: ['motion'],
        template: {
          conditions: [
            { type: 'value', operator: 'equals', value: 'Bewegung' }
          ],
          actions: [
            { type: 'awtrix_display', message: '🏃 Bewegung erkannt!', color: '#00FF00', icon: 3, duration: 3000 }
          ]
        }
      },
      {
        id: 'light_dark',
        name: 'Zu dunkel',
        description: 'Warnt bei zu wenig Licht',
        category: 'Light',
        sensorTypes: ['light'],
        template: {
          conditions: [
            { type: 'value', operator: 'less_than', value: 100 }
          ],
          actions: [
            { type: 'awtrix_display', message: '🌙 Zu dunkel: {sensor_value} lux', color: '#800080', icon: 4 }
          ]
        }
      },
      {
        id: 'power_high',
        name: 'Hoher Stromverbrauch',
        description: 'Warnt bei hohem Stromverbrauch',
        category: 'Power',
        sensorTypes: ['power', 'current'],
        template: {
          conditions: [
            { type: 'value', operator: 'greater_than', value: 1000 }
          ],
          actions: [
            { type: 'awtrix_notification', message: '⚡ Hoher Verbrauch: {sensor_value}W', color: '#FFA500', icon: 5 }
          ]
        }
      }
    ];

    templates.forEach(template => {
      this.ruleTemplates.set(template.id, template);
    });
  }

  getRuleTemplates(): RuleTemplate[] {
    return Array.from(this.ruleTemplates.values());
  }

  createRuleFromTemplate(templateId: string, sensorTopic: string, sensorName: string, sensorType: string): SensorRule | null {
    const template = this.ruleTemplates.get(templateId);
    if (!template) return null;

    const rule: SensorRule = {
      id: `rule_${Date.now()}`,
      name: `${template.name} - ${sensorName}`,
      description: template.description,
      sensorTopic,
      sensorName,
      sensorType,
      conditions: template.template.conditions.map((cond, index) => ({
        id: `cond_${index}`,
        type: cond.type as any,
        operator: cond.operator as any,
        value: cond.value,
        threshold: cond.threshold || 0,
        timeRange: cond.timeRange || { start: '00:00', end: '23:59' },
        pattern: cond.pattern || ''
      })),
      actions: template.template.actions.map((action, index) => ({
        id: `action_${index}`,
        type: action.type as any,
        target: action.target || '',
        message: action.message || '',
        color: action.color || '#FFFFFF',
        icon: action.icon || 0,
        effect: action.effect || 'none',
        duration: action.duration || 5000,
        slot: action.slot || 1,
        priority: action.priority || 1
      })),
      enabled: true,
      priority: 1,
      triggerCount: 0
    };

    this.rules.set(rule.id, rule);
    this.log.info(`Rule created from template: ${rule.name} (${rule.id})`);
    this.emit('ruleCreated', rule);
    
    return rule;
  }

  // Statistics
  getStatistics(): {
    totalRules: number;
    enabledRules: number;
    totalTriggers: number;
    activeSensors: number;
    lastEvaluation: Date;
  } {
    const allRules = this.getAllRules();
    const totalTriggers = allRules.reduce((sum, rule) => sum + rule.triggerCount, 0);
    
    return {
      totalRules: allRules.length,
      enabledRules: allRules.filter(rule => rule.enabled).length,
      totalTriggers,
      activeSensors: this.sensorValues.size,
      lastEvaluation: new Date()
    };
  }
}
