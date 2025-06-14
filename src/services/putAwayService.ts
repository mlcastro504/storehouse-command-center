
import * as PutAwayQueryService from './putAwayQueryService';
import * as PutAwayCommandService from './putAwayCommandService';

export class PutAwayService {
  // Queries
  static getPendingPallets = PutAwayQueryService.getPendingPallets;
  static getActiveTasks = PutAwayQueryService.getActiveTasks;
  static getOperatorPerformance = PutAwayQueryService.getOperatorPerformance;
  static getMetrics = PutAwayQueryService.getMetrics;
  static getPutAwayRules = PutAwayQueryService.getPutAwayRules;
  static getTaskHistory = PutAwayQueryService.getTaskHistory;
  static validateLocationCode = PutAwayQueryService.validateLocationCode;
  static getPutAwayTasks = PutAwayQueryService.getPutAwayTasks;
  static getProducts = PutAwayQueryService.getProducts;
  static getLocations = PutAwayQueryService.getLocations;
  static populateTaskDetails = PutAwayQueryService.populateTaskDetails;

  // Commands
  static claimPallet = PutAwayCommandService.claimPallet;
  static completeTask = PutAwayCommandService.completeTask;
  static cancelTask = PutAwayCommandService.cancelTask;
  static createPutAwayRule = PutAwayCommandService.createPutAwayRule;
  static updatePutAwayRule = PutAwayCommandService.updatePutAwayRule;
  static deletePutAwayRule = PutAwayCommandService.deletePutAwayRule;
  static createPutAwayTask = PutAwayCommandService.createPutAwayTask;
}
