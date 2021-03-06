<html>
	<head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="layout" content="custom" />
        <g:set var="entityName" value="${warehouse.message(code: 'orders.label', default: 'Purchase orders')}" />
        <title><warehouse:message code="default.list.label" args="[entityName]" /></title>
   	</head>
	<body>


		<div class="body">
			<g:if test="${flash.message}">
				<div class="message">${flash.message}</div>
			</g:if>

			<div class="yui-gf">
				<div class="yui-u first">
					<g:render template="filters" model="[]"/>

				</div>
				<div class="yui-u">

					<div class="box">
						<h2><warehouse:message code="default.list.label" args="[entityName]" /> <small>(<g:formatNumber number="${totalPrice}"/>
                            ${grailsApplication.config.openboxes.locale.defaultCurrencyCode})</small></h2>
						<table class="${orders?'dataTable':''}">
							<thead>
								<tr>
									<th>${warehouse.message(code: 'default.actions.label')}</th>
									<th>${warehouse.message(code: 'default.status.label')}</th>
									<th>${warehouse.message(code: 'order.orderNumber.label')}</th>
									<th>${warehouse.message(code: 'default.name.label')}</th>
									<th>${warehouse.message(code: 'order.origin.label')}</th>
									<th>${warehouse.message(code: 'order.destination.label')}</th>
                                    <th>${warehouse.message(code: 'order.orderedBy.label')}</th>
									<th>${warehouse.message(code: 'order.dateOrdered.label')}</th>
									<th>${warehouse.message(code: 'order.orderItems.label')}</th>
									<th class="right">${warehouse.message(code: 'order.totalPrice.label', default: 'Total price')}</th>
									<th>${warehouse.message(code: 'order.currency.label', default: 'Currency')}</th>
								</tr>
							</thead>
							<tbody>
								<g:unless test="${orders}">
									<tr class="prop">
										<td colspan="11">
											<div class="empty fade center">
												<warehouse:message code="orders.none.message"/>
											</div>
										</td>
									</tr>
								</g:unless>

								<g:each var="orderInstance" in="${orders}" status="i">
									<g:set var="totalPrice" value="${totalPrice + (orderInstance.totalPrice()?:0)}"/>
									<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
										<td class="middle">
											<div class="action-menu">
												<g:render template="/order/actions" model="[orderInstance:orderInstance,hideDelete:true]"/>
											</div>
										</td>
										<td class="middle">
											<format:metadata obj="${orderInstance?.status}"/>
										</td>
										<td class="middle">
											<g:link action="show" id="${orderInstance.id}">
												${fieldValue(bean: orderInstance, field: "orderNumber")}
											</g:link>
										</td>
										<td class="middle">
											<g:link action="show" id="${orderInstance.id}">
												${fieldValue(bean: orderInstance, field: "name")}
											</g:link>
										</td>
										<td class="middle">
											${fieldValue(bean: orderInstance, field: "origin.name")}
										</td>
										<td class="middle">
											${fieldValue(bean: orderInstance, field: "destination.name")}
										</td>
                                        <td class="middle center">
                                            ${orderInstance?.orderedBy?.name}
                                        </td>
										<td class="middle">
											<format:date obj="${orderInstance?.dateOrdered}"/>
										</td>
										<td class="middle center">
											${orderInstance?.orderItems?.size()?:0}
										</td>
										<td class="middle right">
											<g:formatNumber number="${orderInstance?.totalPrice()}" />
										</td>
										<td class="middle">
                                            ${grailsApplication.config.openboxes.locale.defaultCurrencyCode}
										</td>
									</tr>
								</g:each>
							</tbody>
                            <%--
							<tfoot>
							<tr class="odd">
								<th colspan="7"><label>${warehouse.message(code:'default.total.label')}</label></th>
								<th colspan="1" class="right">
									<div class="text large">

										<g:formatNumber number="${totalPrice}"/>
										${grailsApplication.config.openboxes.locale.defaultCurrencyCode}

									</div>
								</th>
								<th>

								</th>
							</tr>
							</tfoot>
							--%>
						</table>
					</div>
				</div>

			</div>
		</div>

		<script type="text/javascript">
			$(document).ready(function() {
				$(".clear-all").click(function() {
					$('#statusStartDate-datepicker').val('');					
					$('#statusEndDate-datepicker').val('');
					$('#statusStartDate').val('');					
					$('#statusEndDate').val('');
					$('#totalPrice').val('');
					$('#description').val('');
					$("#origin").val('').trigger("chosen:updated");
					$("#status").val('').trigger("chosen:updated");
				});

                $("#clearStartDate").click(function() {
                    $('#statusStartDate-datepicker').datepicker('setDate', null);
                });
                $("#clearEndDate").click(function() {
                    $('#statusEndDate-datepicker').datepicker('setDate', null);
                });

			});
        </script>
    </body>
</html>